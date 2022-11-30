export function getRealTimeFromUnixTime(unixTime){
    
    let date = new Date(unixTime * 1000);
    
    // console.log(date.toDateString());

    let hours = date.getHours();
    let minutes = "0" + date.getMinutes();
    let seconds = "0" + date.getSeconds();

    let realTime = date.toDateString() + " " + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    return realTime
  }


  export function getOnlyTimeFromUnixTime(unixTime){
    
    let date = new Date(unixTime * 1000);
    
    // console.log(date.toDateString());

    let hours = date.getHours();
    let minutes = "0" + date.getMinutes();
    let seconds = "0" + date.getSeconds();

    let realTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    return realTime
  }