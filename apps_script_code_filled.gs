// === Google Apps Script (Code.gs) — auto-filled SHEET_ID ===
const SHEET_ID = '1OmQX_7FFaxk7z9IMUIyyrHAcAcMaH5OPn6pTSbvwrFk';
const SHEET_NAME = 'kv'; // columns: key | value | updatedAt

function getSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.getRange(1,1,1,3).setValues([['key','value','updatedAt']]);
  }
  return sh;
}

function doGet(e) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const out = {};
  for (let i=1;i<data.length;i++){ const k=data[i][0]; const v=data[i][1]; if(k) out[k] = v ? JSON.parse(v) : null; }
  return ContentService.createTextOutput(JSON.stringify({ok:true, data: out})).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents || '{}');
  const sheet = getSheet();
  const rows = sheet.getDataRange().getValues();
  const idx = {}; for (let i=1;i<rows.length;i++){ if(rows[i][0]) idx[rows[i][0]]=i+1; }
  const now = new Date();
  Object.keys(body||{}).forEach(k=>{
    const json = JSON.stringify(body[k]);
    if (idx[k]) { sheet.getRange(idx[k],2).setValue(json); sheet.getRange(idx[k],3).setValue(now); }
    else { sheet.appendRow([k, json, now]); }
  });
  return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
}