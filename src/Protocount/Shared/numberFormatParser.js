function numberFormatParser(num){
  if(num)
    return ('' + num).replace(
      /(\d)(?=(?:\d{3})+(?:\.|$))|(\.\d\d?)\d*$/g, 
      function(m, s1, s2){
        return s2 || (s1 + ',');
      }
    )
    else return '';
  }

  export default numberFormatParser;

