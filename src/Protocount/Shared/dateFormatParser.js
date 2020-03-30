function dateFormatParser(date){
    if (date) {
        date=new Date(date)
        const month = Number(date.getMonth()) + 1 <10 ? 
        '0'+ (Number(date.getMonth()) + 1) : Number(date.getMonth()) + 1; 
                   
        const day = date.getDate() < 10? 
        '0' + date.getDate() : date.getDate();
        const year = date.getFullYear();
        return day+'-'+month+'-'+year;
    }
    else return '';
}
  
    export default dateFormatParser;
  
  