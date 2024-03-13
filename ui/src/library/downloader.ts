export const Downloader = async (data: string, fileName: string) => {
    const blob = new Blob([data], { type: 'text/plain' })
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (navigator.msSaveBlob !== undefined) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        navigator.msSaveBlob(blob, fileName)
    } else {
        const link = document.createElement('a')
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob)
            link.setAttribute('href', url)
            link.setAttribute('download', fileName)
            link.style.visibility = 'hidden'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    }
}
