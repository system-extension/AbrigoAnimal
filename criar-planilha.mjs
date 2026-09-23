import fs from 'node:fs/promises';
import { Workbook, SpreadsheetFile } from 'file:///C:/Users/marcu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';

const outputDir = 'C:/Users/marcu/Documents/AbrigoAnimal/docs';
const outputPath = `${outputDir}/planilha-exemplo-estoque-financeiro.xlsx`;
const wb = Workbook.create();
const estoque = wb.worksheets.add('Estoque');
const financeiro = wb.worksheets.add('Financeiro');

const palette = { verde:'#164C40', laranja:'#E07A32', creme:'#F7F4EC', linha:'#D9E2D8', texto:'#20352E', claro:'#EEF4ED', amarelo:'#FFF2CC', vermelho:'#FCE8E6' };
function baseSheet(sheet){
  sheet.showGridlines = false;
  sheet.getRange('A1:I40').format.font = { name:'Arial', size:10, color:palette.texto };
  sheet.getRange('A1:I40').format.verticalAlignment = 'center';
}
function title(sheet, name, subtitle){
  sheet.getRange('A2:I2').merge(); sheet.getRange('A2').values=[[name]];
  sheet.getRange('A2').format.font={name:'Arial',size:16,bold:true,color:palette.verde};
  sheet.getRange('A3:I3').merge(); sheet.getRange('A3').values=[[subtitle]];
  sheet.getRange('A3').format.font={name:'Arial',size:10,italic:true,color:'#5C7168'};
  sheet.getRange('A4:I4').format.fill=palette.verde;
}
function header(sheet, range){
  const r=sheet.getRange(range); r.format.fill=palette.verde; r.format.font={name:'Arial',size:10,bold:true,color:'#FFFFFF'}; r.format.horizontalAlignment='center';
}
function border(sheet, range){sheet.getRange(range).format.borders={style:'continuous',color:palette.linha};}
baseSheet(estoque); baseSheet(financeiro);

title(estoque,'Controle de estoque','Modelo de acompanhamento de itens do Abrigo Animal Joinville');
estoque.getRange('A6:B6').merge(); estoque.getRange('A6').values=[['Itens cadastrados']];
estoque.getRange('A7:B7').merge(); estoque.getRange('A7').formulas=[['=COUNTA(A12:A200)']];
estoque.getRange('D6:E6').merge(); estoque.getRange('D6').values=[['Unidades em estoque']];
estoque.getRange('D7:E7').merge(); estoque.getRange('D7').formulas=[['=SUM(D12:D200)']];
estoque.getRange('G6:H6').merge(); estoque.getRange('G6').values=[['Itens para repor']];
estoque.getRange('G7:H7').merge(); estoque.getRange('G7').formulas=[['=COUNTIF(G12:G200,"Repor")']];
for(const cell of ['A6','D6','G6']){estoque.getRange(cell).format.fill=palette.claro; estoque.getRange(cell).format.font={name:'Arial',size:10,bold:true,color:palette.verde};}
for(const cell of ['A7','D7','G7']){estoque.getRange(cell).format.font={name:'Arial',size:16,bold:true,color:palette.laranja};}
estoque.getRange('A11:I11').values=[['Código','Item','Categoria','Quantidade atual','Unidade','Estoque mínimo','Situação','Última atualização','Observação']]; header(estoque,'A11:I11');
const estoqueDados=[
 ['EST-001','Ração adulto','Alimentação',3,'sacos',5,null,new Date('2026-09-20'),'Priorizar compra'],
 ['EST-002','Ração filhote','Alimentação',8,'sacos',4,null,new Date('2026-09-19'),''],
 ['EST-003','Ração idoso','Alimentação',4,'sacos',3,null,new Date('2026-09-18'),'Uso dos cães idosos'],
 ['EST-004','Vermífugo','Saúde',24,'unidades',10,null,new Date('2026-09-20'),''],
 ['EST-005','Vacina múltipla','Saúde',6,'doses',10,null,new Date('2026-09-17'),'Verificar agendamento veterinário'],
 ['EST-006','Tapetes higiênicos','Higiene',18,'pacotes',12,null,new Date('2026-09-20'),''],
 ['EST-007','Coleiras tamanho M','Acessórios',7,'unidades',5,null,new Date('2026-09-16'),''],
 ['EST-008','Produtos de limpeza','Limpeza',2,'frascos',4,null,new Date('2026-09-19'),'Comprar na próxima semana']
];
estoque.getRange(`A12:I${11+estoqueDados.length}`).values=estoqueDados;
estoque.getRange('G12').formulas=[['=IF(D12<=F12,"Repor","OK")']]; estoque.getRange(`G12:G${11+estoqueDados.length}`).fillDown();
estoque.getRange(`H12:H${11+estoqueDados.length}`).format.numberFormat='dd/mm/yyyy';
estoque.getRange(`A11:I${11+estoqueDados.length}`).format.wrapText=true; border(estoque,`A11:I${11+estoqueDados.length}`);
estoque.getRange('G12:G19').conditionalFormats.addCustom('=G12="Repor"',{fill:palette.vermelho,font:{color:'#9C2D20',bold:true}});
estoque.getRange('A11:I19').format.rowHeight=22;
estoque.getRange('A:A').format.columnWidth=12; estoque.getRange('B:B').format.columnWidth=24; estoque.getRange('C:C').format.columnWidth=16; estoque.getRange('D:D').format.columnWidth=16; estoque.getRange('E:E').format.columnWidth=12; estoque.getRange('F:F').format.columnWidth=15; estoque.getRange('G:G').format.columnWidth=12; estoque.getRange('H:H').format.columnWidth=17; estoque.getRange('I:I').format.columnWidth=28;
estoque.freezePanes.freezeRows(11);

title(financeiro,'Controle financeiro','Modelo simplificado de receitas e despesas do Abrigo Animal Joinville');
financeiro.getRange('A6:B6').merge(); financeiro.getRange('A6').values=[['Receitas']];
financeiro.getRange('A7:B7').merge(); financeiro.getRange('A7').formulas=[['=SUMIF(B12:B200,"Receita",E12:E200)']];
financeiro.getRange('D6:E6').merge(); financeiro.getRange('D6').values=[['Despesas']];
financeiro.getRange('D7:E7').merge(); financeiro.getRange('D7').formulas=[['=SUMIF(B12:B200,"Despesa",E12:E200)']];
financeiro.getRange('G6:H6').merge(); financeiro.getRange('G6').values=[['Saldo do período']];
financeiro.getRange('G7:H7').merge(); financeiro.getRange('G7').formulas=[['=A7-D7']];
for(const cell of ['A6','D6','G6']){financeiro.getRange(cell).format.fill=palette.claro; financeiro.getRange(cell).format.font={name:'Arial',size:10,bold:true,color:palette.verde};}
for(const cell of ['A7','D7','G7']){financeiro.getRange(cell).format.font={name:'Arial',size:16,bold:true,color:palette.laranja}; financeiro.getRange(cell).format.numberFormat='R$ #,##0.00;[Red](R$ #,##0.00);-';}
financeiro.getRange('A11:H11').values=[['Data','Tipo','Categoria','Descrição','Valor (R$)','Forma de pagamento','Responsável','Observação']]; header(financeiro,'A11:H11');
const financeiraDados=[
 [new Date('2026-09-02'),'Receita','Doação','Doação via Pix',450,'Pix','Equipe financeira',''],
 [new Date('2026-09-05'),'Receita','Apadrinhamento','Contribuições mensais',320,'Transferência','Equipe financeira',''],
 [new Date('2026-09-08'),'Receita','Evento','Bazar solidário',125,'Dinheiro','Equipe de eventos',''],
 [new Date('2026-09-10'),'Despesa','Alimentação','Compra de ração adulto',390,'Cartão','Compras',''],
 [new Date('2026-09-12'),'Despesa','Saúde','Vacinas e atendimento',240,'Pix','Equipe veterinária',''],
 [new Date('2026-09-15'),'Despesa','Veterinário','Consulta de rotina',180,'Pix','Equipe veterinária',''],
 [new Date('2026-09-17'),'Despesa','Limpeza','Produtos de limpeza',96,'Cartão','Compras',''],
 [new Date('2026-09-19'),'Despesa','Operação','Água e energia',150,'Boleto','Administrativo','']
];
financeiro.getRange(`A12:H${11+financeiraDados.length}`).values=financeiraDados;
financeiro.getRange('A12:A19').format.numberFormat='dd/mm/yyyy'; financeiro.getRange('E12:E19').format.numberFormat='R$ #,##0.00;[Red](R$ #,##0.00);-';
financeiro.getRange('A11:H19').format.wrapText=true; border(financeiro,'A11:H19'); financeiro.getRange('A11:H19').format.rowHeight=22;
financeiro.getRange('B12:B19').conditionalFormats.addCustom('=B12="Despesa"',{fill:'#FFF4EE',font:{color:'#9C4A24'}});
financeiro.getRange('A:A').format.columnWidth=14; financeiro.getRange('B:B').format.columnWidth=13; financeiro.getRange('C:C').format.columnWidth=18; financeiro.getRange('D:D').format.columnWidth=28; financeiro.getRange('E:E').format.columnWidth=14; financeiro.getRange('F:F').format.columnWidth=20; financeiro.getRange('G:G').format.columnWidth=18; financeiro.getRange('H:H').format.columnWidth=24;
financeiro.freezePanes.freezeRows(11);

wb.recalculate();
await fs.mkdir(outputDir,{recursive:true});
const inspect=await wb.inspect({kind:'workbook,sheet,formula',maxChars:6000});
console.log(inspect.ndjson);
for(const name of ['Estoque','Financeiro']){const img=await wb.render({sheetName:name,autoCrop:'all',scale:1,format:'png'});await fs.writeFile(`${outputDir}/${name.toLowerCase()}-preview.png`,new Uint8Array(await img.arrayBuffer()));}
const out=await SpreadsheetFile.exportXlsx(wb); await out.save(outputPath);
console.log(outputPath);

