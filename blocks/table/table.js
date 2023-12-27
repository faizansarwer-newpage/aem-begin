async function createTableFromUrl(url) {
    console.log(url);
    const countries = await fetch(url).then(res => res.json());
    console.log(countries);

    const table = `
        <table class="table"> 
            ${getTableHead(countries.data[0])}
            ${getTableRows(countries.data)}
        </table>
    `;
    return table;
}
function getTableData(json) {
    const header = ['<tr>'];
    Object.keys(json).forEach( th => {
        header.push(`<td>${json[th]}</td>`);
    });
    header.push('</tr>');
    return header.join("");

}
function getTableHead(json) {
    const header = ['<tr>'];
    Object.keys(json).forEach( th => {
        header.push(`<td>${th}</td>`);
    });
    header.push('</tr>');
    return header.join("");

}

function getTableRows(json) {
    const result = [];
    json.forEach( tr => {
        const row = getTableData(tr) ;
        result.push(row);
    });
    return result.join('');

}

export default async function decorate(block) {
    const countries = block.querySelector('a[href$="countries.json"]');
    const table  = await createTableFromUrl(countries.href);
    console.log(table)
    block.innerHTML = table;
}
