/**
 * HTML 代码片段定义
 * 用于 Monaco 编辑器的 HTML 自动补全
 */

export interface HtmlSnippet {
  label: string;
  insertText: string;
  documentation?: string;
}

/**
 * HTML 标签补全列表
 */
export const htmlTagSnippets: HtmlSnippet[] = [
  // 基础结构
  {
    label: "!",
    insertText:
      '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n\t<meta charset="UTF-8">\n\t<meta name="viewport" content="width=device-width, initial-scale=1.0">\n\t<title>${1:文档标题}</title>\n</head>\n<body>\n\t${2}\n</body>\n</html>',
    documentation: "HTML5 文档框架",
  },

  // 文档结构
  { label: "html", insertText: '<html lang="${1:zh-CN}">\n\t${2}\n</html>' },
  { label: "head", insertText: "<head>\n\t${1}\n</head>" },
  { label: "body", insertText: "<body>\n\t${1}\n</body>" },
  { label: "title", insertText: "<title>${1}</title>" },
  { label: "meta", insertText: '<meta ${1:name}="${2:content}">' },
  {
    label: "link",
    insertText: '<link rel="${1:stylesheet}" href="${2:style.css}">',
  },
  {
    label: "script",
    insertText: '<script${1: type="text/javascript"}>\n\t${2}\n</script>',
  },
  { label: "script:src", insertText: '<script src="${1:script.js}"></script>' },
  { label: "style", insertText: "<style>\n\t${1}\n</style>" },

  // 文本内容
  { label: "h1", insertText: "<h1>${1}</h1>" },
  { label: "h2", insertText: "<h2>${1}</h2>" },
  { label: "h3", insertText: "<h3>${1}</h3>" },
  { label: "h4", insertText: "<h4>${1}</h4>" },
  { label: "h5", insertText: "<h5>${1}</h5>" },
  { label: "h6", insertText: "<h6>${1}</h6>" },
  { label: "p", insertText: "<p>${1}</p>" },
  { label: "br", insertText: "<br>" },
  { label: "hr", insertText: "<hr>" },
  { label: "comment", insertText: "<!-- ${1} -->" },
  { label: "span", insertText: "<span>${1}</span>" },

  // 格式化
  { label: "b", insertText: "<b>${1}</b>" },
  { label: "i", insertText: "<i>${1}</i>" },
  { label: "strong", insertText: "<strong>${1}</strong>" },
  { label: "em", insertText: "<em>${1}</em>" },
  { label: "mark", insertText: "<mark>${1}</mark>" },
  { label: "small", insertText: "<small>${1}</small>" },
  { label: "sub", insertText: "<sub>${1}</sub>" },
  { label: "sup", insertText: "<sup>${1}</sup>" },
  { label: "code", insertText: "<code>${1}</code>" },
  { label: "pre", insertText: "<pre>\n\t${1}\n</pre>" },

  // 列表
  { label: "ul", insertText: "<ul>\n\t<li>${1}</li>\n</ul>" },
  { label: "ol", insertText: "<ol>\n\t<li>${1}</li>\n</ol>" },
  { label: "li", insertText: "<li>${1}</li>" },
  { label: "dl", insertText: "<dl>\n\t<dt>${1}</dt>\n\t<dd>${2}</dd>\n</dl>" },
  { label: "dt", insertText: "<dt>${1}</dt>" },
  { label: "dd", insertText: "<dd>${1}</dd>" },

  // 表格
  {
    label: "table",
    insertText: "<table>\n\t<tr>\n\t\t<td>${1}</td>\n\t</tr>\n</table>",
  },
  {
    label: "table:full",
    insertText:
      "<table>\n\t<thead>\n\t\t<tr>\n\t\t\t<th>${1}</th>\n\t\t</tr>\n\t</thead>\n\t<tbody>\n\t\t<tr>\n\t\t\t<td>${2}</td>\n\t\t</tr>\n\t</tbody>\n</table>",
  },
  { label: "tr", insertText: "<tr>\n\t${1}\n</tr>" },
  { label: "td", insertText: "<td>${1}</td>" },
  { label: "th", insertText: "<th>${1}</th>" },
  { label: "caption", insertText: "<caption>${1}</caption>" },
  { label: "thead", insertText: "<thead>\n\t${1}\n</thead>" },
  { label: "tbody", insertText: "<tbody>\n\t${1}\n</tbody>" },
  { label: "tfoot", insertText: "<tfoot>\n\t${1}\n</tfoot>" },

  // 链接和媒体
  { label: "a", insertText: '<a href="${1}">${2}</a>' },
  { label: "a:blank", insertText: '<a href="${1}" target="_blank">${2}</a>' },
  { label: "img", insertText: '<img src="${1}" alt="${2}">' },
  {
    label: "audio",
    insertText:
      '<audio controls>\n\t<source src="${1}" type="audio/${2:mp3}">\n\t您的浏览器不支持音频元素\n</audio>',
  },
  {
    label: "video",
    insertText:
      '<video width="${1:320}" height="${2:240}" controls>\n\t<source src="${3}" type="video/${4:mp4}">\n\t您的浏览器不支持视频元素\n</video>',
  },
  { label: "source", insertText: '<source src="${1}" type="${2}">' },
  {
    label: "iframe",
    insertText:
      '<iframe src="${1}" width="${2:600}" height="${3:400}" frameborder="${4:0}">${5}</iframe>',
  },

  // 区块和分区
  { label: "div", insertText: "<div>${1}</div>" },
  { label: "header", insertText: "<header>\n\t${1}\n</header>" },
  { label: "footer", insertText: "<footer>\n\t${1}\n</footer>" },
  { label: "main", insertText: "<main>\n\t${1}\n</main>" },
  { label: "section", insertText: "<section>\n\t${1}\n</section>" },
  { label: "article", insertText: "<article>\n\t${1}\n</article>" },
  { label: "aside", insertText: "<aside>\n\t${1}\n</aside>" },
  { label: "nav", insertText: "<nav>\n\t${1}\n</nav>" },
  {
    label: "figure",
    insertText: "<figure>\n\t${1}\n\t<figcaption>${2}</figcaption>\n</figure>",
  },
  { label: "figcaption", insertText: "<figcaption>${1}</figcaption>" },

  // 表单元素
  {
    label: "form",
    insertText: '<form action="${1}" method="${2:post}">\n\t${3}\n</form>',
  },
  {
    label: "input",
    insertText: '<input type="${1:text}" name="${2}" placeholder="${3}">',
  },
  {
    label: "input:text",
    insertText: '<input type="text" name="${1}" placeholder="${2}">',
  },
  {
    label: "input:email",
    insertText: '<input type="email" name="${1}" placeholder="${2}">',
  },
  {
    label: "input:password",
    insertText: '<input type="password" name="${1}" placeholder="${2}">',
  },
  {
    label: "input:number",
    insertText: '<input type="number" name="${1}" min="${2}" max="${3}">',
  },
  {
    label: "input:checkbox",
    insertText: '<input type="checkbox" name="${1}" value="${2}">',
  },
  {
    label: "input:radio",
    insertText: '<input type="radio" name="${1}" value="${2}">',
  },
  {
    label: "input:submit",
    insertText: '<input type="submit" value="${1:提交}">',
  },
  { label: "button", insertText: '<button type="${1:button}">${2}</button>' },
  {
    label: "select",
    insertText:
      '<select name="${1}">\n\t<option value="${2}">${3}</option>\n</select>',
  },
  { label: "option", insertText: '<option value="${1}">${2}</option>' },
  {
    label: "textarea",
    insertText:
      '<textarea name="${1}" rows="${2:4}" cols="${3:40}">${4}</textarea>',
  },
  { label: "label", insertText: '<label for="${1}">${2}</label>' },
  {
    label: "fieldset",
    insertText: "<fieldset>\n\t<legend>${1}</legend>\n\t${2}\n</fieldset>",
  },
  { label: "legend", insertText: "<legend>${1}</legend>" },

  // HTML5 语义化元素
  {
    label: "details",
    insertText: "<details>\n\t<summary>${1}</summary>\n\t${2}\n</details>",
  },
  { label: "summary", insertText: "<summary>${1}</summary>" },
  { label: "mark", insertText: "<mark>${1}</mark>" },
  {
    label: "progress",
    insertText: '<progress value="${1}" max="${2:100}">${3}</progress>',
  },
  { label: "time", insertText: '<time datetime="${1}">${2}</time>' },
  {
    label: "datalist",
    insertText: '<datalist id="${1}">\n\t<option value="${2}">\n</datalist>',
  },
  {
    label: "output",
    insertText: '<output name="${1}" for="${2}">${3}</output>',
  },

  // 邮件模板特殊元素
  {
    label: "email:layout",
    insertText:
      '<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%; max-width:600px; margin:0 auto;">\n\t<tr>\n\t\t<td>${1}</td>\n\t</tr>\n</table>',
  },
  {
    label: "email:row",
    insertText:
      '<tr>\n\t<td style="padding:${1:10px};">\n\t\t${2}\n\t</td>\n</tr>',
  },
  {
    label: "email:image",
    insertText:
      '<img src="${1}" width="${2:100%}" height="auto" alt="${3}" style="display:block; border:0;">',
  },
  {
    label: "email:button",
    insertText:
      '<a href="${1}" style="display:inline-block; padding:10px 20px; background-color:#4CAF50; color:white; text-decoration:none; border-radius:5px; font-weight:bold;">${2:按钮文本}</a>',
  },
  {
    label: "email:divider",
    insertText:
      '<tr><td style="padding:10px 0;"><div style="height:1px; width:100%; background-color:#e0e0e0;"></div></td></tr>',
  },
];

/**
 * HTML 属性补全列表
 */
export const htmlAttributeSnippets: HtmlSnippet[] = [
  { label: "id", insertText: 'id="${1}"' },
  { label: "class", insertText: 'class="${1}"' },
  { label: "style", insertText: 'style="${1}"' },
  { label: "href", insertText: 'href="${1}"' },
  { label: "src", insertText: 'src="${1}"' },
  { label: "alt", insertText: 'alt="${1}"' },
  { label: "title", insertText: 'title="${1}"' },
  { label: "target", insertText: 'target="${1:_blank}"' },
  { label: "width", insertText: 'width="${1}"' },
  { label: "height", insertText: 'height="${1}"' },
  { label: "disabled", insertText: "disabled" },
  { label: "placeholder", insertText: 'placeholder="${1}"' },
  { label: "value", insertText: 'value="${1}"' },
  { label: "name", insertText: 'name="${1}"' },
  { label: "type", insertText: 'type="${1}"' },
  { label: "required", insertText: "required" },
  { label: "readonly", insertText: "readonly" },
  { label: "maxlength", insertText: 'maxlength="${1}"' },
  { label: "min", insertText: 'min="${1}"' },
  { label: "max", insertText: 'max="${1}"' },
  { label: "step", insertText: 'step="${1}"' },
  { label: "onclick", insertText: 'onclick="${1}"' },
  { label: "onsubmit", insertText: 'onsubmit="${1}"' },
  { label: "role", insertText: 'role="${1}"' },
  { label: "aria-label", insertText: 'aria-label="${1}"' },
  { label: "data-", insertText: 'data-${1}="${2}"' },
];
