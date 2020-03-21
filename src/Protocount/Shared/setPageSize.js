function setPageSize(cssPageSize) {
    if (document.getElementById('pageStyle')) 
        document.getElementById('pageStyle').innerHTML = `@media print {@page {size: ${cssPageSize}}}`;

    else {
        const style = document.createElement('style')
        style.setAttribute('id','pageStyle');
        document.head.appendChild(style);
        document.getElementById('pageStyle').innerHTML = `@media print {@page {size: ${cssPageSize}}}`;
    }
    
}

export default setPageSize;