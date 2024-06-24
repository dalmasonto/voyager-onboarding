export const shortString = (str: string, start: number = 5, end: number = 5) => {
	if (!str) return str
	if (str && str.length < start + end) return str;
	return `${str.substring(0, start)}...${str.substring(str.length - end, str.length - 1)}`
}


export const convertTsToReadableTime = (ts: string) => {
	let date = new Date(Number(ts) * 1000)
	let options: any = {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour12: false,
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric'
	}
	let formatedDate = new Intl.DateTimeFormat("en-US", options).format(date)
	return formatedDate.replace(', ', ' ')
}

export const replaceText = (str: string, replace: string, replaceWith: string) => {
	if (!str) return ''
	const regex = new RegExp(replace, 'gi');
    return str.replace(regex, replaceWith);
}

export const PageSizeArray = ['5', '10', '25', '50', '100']

export const isValidPageSize = (value: string) => {
	return PageSizeArray.includes(value);
}