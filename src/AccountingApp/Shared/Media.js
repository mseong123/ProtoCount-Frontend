import {useEffect,useState} from 'react';

/*Media component for setting screenIsSmall state during initial mounting and also attach matchMedia listener that fires when screen width 
<768px or >768px and changes state when that happens. */

function Media (props) {
    const [screenIsSmall,changeMedia]=useState(window.innerWidth<768? true:false)

    useEffect(()=>{
        
        const x=window.matchMedia('(max-width: 768px)');
        const handler=(e)=>{
            if (e.matches) changeMedia(true) 
            else changeMedia(false)
        }
        x.addListener((e)=>handler(e))
            
        
        return x.removeListener((e)=>handler(e))
    },[])
    
    return props.render(screenIsSmall);
}
export default Media;