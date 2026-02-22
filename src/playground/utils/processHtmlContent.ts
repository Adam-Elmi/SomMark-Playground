function processHtmlContent(html: string): string {
    const temp = document.createElement("div");
    temp.innerHTML = html;

    const links = temp.querySelectorAll<HTMLAnchorElement>("a");

    links.forEach(link => {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
    });

    return temp.innerHTML;
}
export default processHtmlContent;