/**
 * Function to format a datetime string to date string with mm/dd/yyyy, dd/mm/yyyy or yyyy/mm/dd
 * @param datetime : datetime string
 * @param formatNum : format number: 1 (mm/dd/yyyy), 2 (dd/mm/yyyy) and 3 (yyyy/mm/dd). Default format number = 1
 * @returns date formatted string mm/dd/yyyy, dd/mm/yyyy or yyyy/mm/dd based on format number
 */
export function dateFormat(datetime: string, formatNum: number = 1){
    let dt = new Date(datetime);

    switch(formatNum){
        case 1:
            return ((dt.getMonth()+1) + '/' + dt.getDate() + '/' + dt.getFullYear()); // mm/dd/yyyy
        case 2:
            return (dt.getDate() + '/' + (dt.getMonth()+1) + '/' + dt.getFullYear()); // dd/mm/yyyy
        case 3:
            return (dt.getFullYear() + '/' + (dt.getMonth()+1) + '/' + dt.getDate()); // yyyy/mm/dd
    }
}

/**
 * Function to format a datetime string to time string in 12 hour AM/PM
 * @param datetime : datetime string
 * @returns time formatted string
 */
export function timeFormat(datetime: string){
    let date = new Date(datetime);
    let hours = date.getHours(),
        minutes = date.getMinutes();

    var amOrPm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    let m = minutes < 10 ? '0'+minutes : minutes;
    
    let timeFormatted = hours + ':' + m + ' ' + amOrPm;
    return timeFormatted;
}