// Configurações do Repositório
var REPOS_FOLDER_ID = "1HtfwiaCXtjYoyXKhCqAKbkN7h-Z8BWQL";

// FUNÇÃO PARA FORÇAR AUTORIZAÇÃO COMPLETA (LEITURA E ESCRITA): 
// Selecione 'setupDrivePermissions' no menu superior e clique em 'Executar'
function setupDrivePermissions() {
    var folder = DriveApp.getFolderById(REPOS_FOLDER_ID);
    // A linha abaixo é necessária para forçar o pedido de permissão de escrita/criação
    var dummy = folder.createFile("Permissão", "Verificando Escrita", MimeType.PLAIN_TEXT);
    dummy.setTrashed(true); // Apaga o arquivo de teste logo em seguida
    Logger.log("Permissões de Leitura e Escrita do Drive verificadas!");
}

function doPost(e) {
    try {
        var request = JSON.parse(e.postData.contents);
        var action = request.action;
        var data = request.data;

        // Custom Repository Actions
        if (action === 'uploadFile') {
            return uploadFile(data);
        } else if (action === 'listFiles') {
            return listFiles();
        }

        var sheetName = data.tab || data.type;
        if (sheetName === 'timeline') sheetName = 'Cronograma';
        if (sheetName === 'checklist') sheetName = 'Checklist';

        var ss = SpreadsheetApp.getActiveSpreadsheet();
        var sheet = ss.getSheetByName(sheetName);

        if (!sheet) return response({ "success": false, "error": "Aba não encontrada: " + sheetName });

        if (action === 'createTask') {
            return createTaskSmart(sheet, data);
        }

        var targetId = data.id;
        if (!targetId) return response({ "success": false, "error": "ID não fornecido" });

        var row = findRowById(sheet, targetId);
        if (row === -1) {
            return response({ "success": false, "error": "ID " + targetId + " não encontrado na aba " + sheetName });
        }

        if (action === 'updateTask') {
            return updateTask(sheet, row, data);
        } else if (action === 'deleteTask') {
            sheet.deleteRow(row);
            return response({ "success": true });
        } else if (action === 'moveTask') {
            return moveTask(sheet, row, data.direction);
        }

        return response({ "success": false, "error": "Ação desconhecida" });
    } catch (err) {
        return response({ "success": false, "error": err.toString() });
    }
}

function findRowById(sheet, id) {
    var data = sheet.getRange("A:A").getValues();
    for (var i = 0; i < data.length; i++) {
        if (data[i][0].toString().trim() == id.toString().trim()) {
            return i + 1;
        }
    }
    return -1;
}

function createTaskSmart(sheet, data) {
    var allValues = sheet.getRange("A:B").getValues();
    var nextId = 1;
    var maxRow = sheet.getLastRow();

    for (var i = 1; i < allValues.length; i++) {
        var currentId = Number(allValues[i][0]);
        if (!isNaN(currentId) && currentId >= nextId) nextId = currentId + 1;
    }

    var targetScope = (data.category || data.dateGroup || "").toString().toUpperCase().trim();
    var insertionRow = maxRow + 1;

    if (targetScope) {
        for (var i = 0; i < allValues.length; i++) {
            var cellText = allValues[i][1].toString().toUpperCase().trim();
            if (cellText === targetScope) {
                insertionRow = i + 2;
                sheet.insertRowBefore(insertionRow);
                break;
            }
        }
    }

    if (insertionRow > maxRow) insertionRow = maxRow + 1;

    var newRow;
    if (sheet.getName() === 'Cronograma') {
        newRow = [nextId, data.startDate, data.endDate, data.time, data.action, data.responsible, '', data.agent, data.observation, data.status, ''];
    } else {
        newRow = [nextId, data.subject, data.responsible, data.startDate, data.endDate, data.status, data.observation, '', data.category];
    }

    sheet.getRange(insertionRow, 1, 1, newRow.length).setValues([newRow]);
    return response({ "success": true, "id": nextId });
}

function updateTask(sheet, row, data) {
    if (sheet.getName() === 'Cronograma') {
        sheet.getRange(row, 2, 1, 10).setValues([[
            data.startDate, data.endDate, data.time, data.action, data.responsible, '', data.agent, data.observation, data.status, data.history || ''
        ]]);
    } else {
        sheet.getRange(row, 2, 1, 8).setValues([[
            data.subject, data.responsible, data.startDate, data.endDate, data.status, data.observation, data.history || '', data.category
        ]]);
    }
    return response({ "success": true });
}

function moveTask(sheet, row, direction) {
    var targetRow = direction === 'up' ? row - 1 : row + 1;
    if (targetRow <= 1 || targetRow > sheet.getLastRow()) return response({ "success": false });

    var range1 = sheet.getRange(row, 1, 1, sheet.getLastColumn());
    var range2 = sheet.getRange(targetRow, 1, 1, sheet.getLastColumn());
    var values1 = range1.getValues();
    var values2 = range2.getValues();

    range1.setValues(values2);
    range2.setValues(values1);
    return response({ "success": true });
}

function response(obj) {
    return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Função para disparar alertas de e-mail sobre tarefas em atraso.
 * Pode ser configurada como um Acionador (Trigger) diário.
 */
function sendOverdueTaskAlerts() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var now = new Date();
    now.setHours(0, 0, 0, 0);
    Logger.log("--- INICIANDO VERIFICAÇÃO DE ATRASOS ---");

    // 1. Mapear Usuários -> E-mails (Planilha Externa)
    var userSS_Id = "1alRRx6YlcVKL1qk3UewXvn_AwFH9ddnFOKpy7t9eXeE";
    var userMapping = {};
    try {
        var userSS = SpreadsheetApp.openById(userSS_Id);
        var userSheet = userSS.getSheetByName("autentica_user") || userSS.getSheets()[0];

        if (userSheet) {
            var userData = userSheet.getDataRange().getValues();
            var userHeaders = userData[0].map(function (h) { return h.toString().toUpperCase().trim(); });

            var nameIdx = userHeaders.indexOf("NOME COMPLETO");
            var emailIdx = userHeaders.indexOf("EMAIL");
            if (nameIdx === -1) nameIdx = 2; // Col C
            if (emailIdx === -1) emailIdx = 3; // Col D

            for (var i = 1; i < userData.length; i++) {
                var name = (userData[i][nameIdx] || "").toString().toUpperCase().trim();
                var email = (userData[i][emailIdx] || "").toString().trim();
                if (name && email) {
                    // Normaliza para ignorar acentos/espaços no mapeamento
                    var cleanName = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    userMapping[cleanName] = email;
                }
            }
            Logger.log("Mapeamento carregado com " + Object.keys(userMapping).length + " nomes.");
        }
    } catch (e) {
        Logger.log("ERRO ao acessar planilha de usuários: " + e.toString());
    }

    var tasksByAgent = {};
    var countOverdue = 0;

    // 2. Processar Cronograma e Checklist
    ["Cronograma", "Checklist"].forEach(function (sName) {
        var s = ss.getSheetByName(sName);
        if (!s) return;

        var data = s.getDataRange().getValues();
        if (data.length <= 1) return;

        var headers = data[0].map(function (h) { return h.toString().toUpperCase().trim(); });

        var colIdx = {
            id: findCol(headers, ["ID"]),
            status: findCol(headers, ["STATUS"]),
            end: findCol(headers, ["DATA FINALIZAÇÃO", "DATA FIM", "DATA ENCERRAMENTO"]),
            agent: findCol(headers, ["AGENTE (OPERACIONAL)", "AGENTE"]),
            resp: findCol(headers, ["EMPRESA RESPONSÁVEL", "RESPONSÁVEL"]),
            desc: sName === "Cronograma" ? findCol(headers, ["AÇÃO / TÍTULO", "AÇÃO"]) : findCol(headers, ["ASSUNTO / DESCRIÇÃO", "ASSUNTO"])
        };

        if (colIdx.status === -1 || colIdx.end === -1) return;

        for (var i = 1; i < data.length; i++) {
            var row = data[i];
            var status = (row[colIdx.status] || "").toString().toUpperCase().trim();
            var agent = (row[colIdx.agent] || "").toString().toUpperCase().trim();
            var resp = (row[colIdx.resp] || "").toString().toUpperCase().trim();
            var endDateRaw = row[colIdx.end];

            if (status === "FINALIZADO" || !endDateRaw) continue;

            var endDate = parseBRDate(endDateRaw);
            if (endDate && endDate < now) {
                var targetAgent = agent || resp;
                if (!targetAgent || targetAgent === "TODOS" || targetAgent === "0") continue;

                if (!tasksByAgent[targetAgent]) tasksByAgent[targetAgent] = [];
                tasksByAgent[targetAgent].push({
                    id: row[colIdx.id],
                    desc: row[colIdx.desc],
                    date: Utilities.formatDate(endDate, "GMT-3", "dd/MM/yyyy"),
                    sheet: sName
                });
                countOverdue++;
                Logger.log("Atraso: " + targetAgent + " - " + row[colIdx.desc]);
            }
        }
    });

    // 3. Enviar E-mails
    var sent = 0;
    for (var agentName in tasksByAgent) {
        var cleanAgent = agentName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        var email = userMapping[cleanAgent];

        if (email) {
            var body = "Olá, " + agentName + "!\n\nVocê tem tarefas em atraso no sistema:\n\n";
            tasksByAgent[agentName].forEach(function (t) {
                body += "- [" + t.sheet + "] ID " + t.id + ": " + t.desc + " (Vencido em: " + t.date + ")\n";
            });
            body += "\nAcesse: https://sandybrown-nightingale-340143.hostingersite.com/";

            MailApp.sendEmail(email, "⚠️ ALERTA: Tarefas em Atraso", body);
            Logger.log("E-mail enviado para: " + email + " (" + agentName + ")");
            sent++;
        } else {
            Logger.log("AVISO: E-mail não encontrado para '" + agentName + "'. Verifique se o nome está cadastrado na planilha de Controle de Acesso.");
        }
    }
    Logger.log("FIM DO PROCESSO. E-mails enviados: " + sent);
}

function findCol(headers, names) {
    for (var i = 0; i < names.length; i++) {
        var idx = headers.indexOf(names[i]);
        if (idx !== -1) return idx;
    }
    return -1;
}

function listFiles() {
    try {
        var folder = DriveApp.getFolderById(REPOS_FOLDER_ID);
        var files = folder.getFiles();
        var result = [];

        while (files.hasNext()) {
            var file = files.next();
            result.push({
                id: file.getId(),
                name: file.getName(),
                mimeType: file.getMimeType(),
                url: file.getUrl(),
                downloadUrl: "https://drive.google.com/uc?export=download&id=" + file.getId(),
                size: file.getSize(),
                date: Utilities.formatDate(file.getDateCreated(), "GMT-3", "dd/MM/yyyy HH:mm")
            });
        }

        return response({ "success": true, "files": result });
    } catch (err) {
        return response({ "success": false, "error": err.toString() });
    }
}

function uploadFile(data) {
    try {
        var folder = DriveApp.getFolderById(REPOS_FOLDER_ID);
        var fileName = data.name || "Sem Nome";
        var contentType = data.mimeType || "application/octet-stream";
        var base64Data = data.base64;

        if (!base64Data) return response({ "success": false, "error": "Nenhum dado recebido" });

        var decodedData = Utilities.base64Decode(base64Data);
        var blob = Utilities.newBlob(decodedData, contentType, fileName);
        var file = folder.createFile(blob);

        return response({
            "success": true,
            "file": {
                id: file.getId(),
                name: file.getName(),
                url: file.getUrl()
            }
        });
    } catch (err) {
        return response({ "success": false, "error": err.toString() });
    }
}

function parseBRDate(dateVal) {
    if (!dateVal) return null;
    if (dateVal instanceof Date) {
        var d = new Date(dateVal);
        d.setHours(0, 0, 0, 0);
        return d;
    }
    if (typeof dateVal === 'string') {
        var parts = dateVal.split('/');
        if (parts.length === 3) return new Date(parts[2], parts[1] - 1, parts[0]);
    }
    return null;
}
