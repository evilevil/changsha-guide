/** 极简行内富文本：把 **粗体** 渲染为 <strong>，同时转义 HTML。 */
export function rich(input: string): string {
  const escaped = input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

/** 去掉 ** 标记，用于 <title> / meta 等纯文本场景。 */
export function plain(input: string): string {
  return input.replace(/\*\*(.+?)\*\*/g, '$1');
}
