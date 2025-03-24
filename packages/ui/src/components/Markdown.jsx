import { MuiMarkdown, getOverrides } from 'mui-markdown';
import styled from '@emotion/styled';
import Link from '@mui/material/Link';
import { marked } from 'marked'
import { Highlight, themes } from 'prism-react-renderer';
import Table from '@mui/material/Table';
import { createContext, useCallback, useContext, useMemo, useRef } from 'react';
import {Box, createTheme, tableCellClasses, ThemeProvider} from '@mui/material';
import ExcellentExport from 'excellentexport';
import { removeTagsFromTableCells, useDownloadTableToHtml } from "@/components/useDownloadTableToHtml.js";
import { useDownloadMarkdown } from '@/components/useDownloadMarkdown';
import SplitButton from '@/components/SplitButton';
import useToast from './useToast';
import Tooltip from '@/components/Tooltip';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useTheme } from '@emotion/react';
// import useAlitaTheme from '@/useAlitaTheme';
import useMonitorOnCopyEvent from './ChatBox/useMonitorOnCopyEvent';

export const MarkdownContext = createContext();

export const MarkdownProvider = ({
                                   children,
                                   interaction_uuid,
                                   conversation_uuid
                                 }) => {
  return (
    <MarkdownContext.Provider
      value={{
        interaction_uuid,
        conversation_uuid
      }}
    >
      {children}
    </MarkdownContext.Provider>
  );
};


function removeHTMLTags(htmlString) {
  return htmlString.replace(/<\/?[^>]+(>|$)/g, "");
}

const MarkdownMapping = {
  h1: {
    component: 'h1',
    props: {
    },
  },
  h2: {
    component: 'h2',
    props: {
    },
  },
  h3: {
    component: 'h3',
    props: {
    },
  },
  h4: {
    component: 'h4',
    props: {
    },
  },
  h5: {
    component: 'h5',
    props: {
    },
  },
  h6: {
    component: 'h6',
    props: {
    },
  },
  p: {
    component: 'p',
    props: {
      style: { marginBlockStart: '0px' }
    },
  },
  span: {
    component: 'span',
    props: {
    },
  },
  a: {
    component: Link,
    props: {
      target: '_blank'
    },
  },
  li: {
    component: 'li',
    props: {
    },
  },
}

export const StyledDiv = styled('div')(() => `
  background: transparent;
`);

export const StyledTable = ({ children, tableRowData, enableDownload }) => {
  const theme = useTheme()
  const tableRef = useRef();
  const downloadLink = useRef();
  const localGridTheme = useMemo(() => {
    return createTheme(theme, {});
  }, [theme]);
  const { toastInfo } = useToast();
  const {
    interaction_uuid,
    conversation_uuid,
  } = useContext(MarkdownContext) || {}
  
  const options = useMemo(() => [{ label: 'Copy as markdown', value: 'markdown' },
    { label: 'Copy as html', value: 'html' },
    { label: 'Download as xlsx', value: 'xlsx' }
  ], [])
  
  const { onCopyHtml } = useDownloadTableToHtml({
    tableRef: tableRef.current,
    filename: 'table',
  })
  
  const onDownloadExcel = useCallback(() => {
    ExcellentExport.convert({
      anchor: downloadLink.current,
      filename: 'table',
      format: 'xlsx',
      openAsDownload: true,
    }, [{
      name: 'worksheet',
      from: {
        table: removeTagsFromTableCells(tableRef.current)
      }
    }], 'xlsx');
  }, [])
  
  
  const { onCopyRawTable } = useDownloadMarkdown({
    markdown: tableRowData,
    filename: 'table.md',
  })
  
  const onClick = useCallback(
    (option) => {
      switch (option) {
        case 'markdown':
          onCopyRawTable();
          // toastInfo('The markdown presentation of the table has been copied into clipboard');
          break;
        case 'html':
          onCopyHtml();
          // toastInfo('The html presentation of the table has been copied into clipboard');
          break
        case 'xlsx':
          onDownloadExcel();
          break
        default:
          break;
      }
    },
    [onCopyHtml, onCopyRawTable, onDownloadExcel, toastInfo],
  )
  
  const { onClickDownload } = useMonitorOnCopyEvent({ interaction_uuid, conversation_uuid, onDownload: onClick })
  
  return (
    <>
      <Box sx={{ width: '100%', overflowX: 'auto', marginTop: '8px', minWidth: '670px' }}>
        <ThemeProvider theme={localGridTheme}>
          <Table ref={tableRef} sx={{
            '& .MuiTableCell-root': {
              whiteSpace: 'normal',
              overflowWrap: 'break-word',
              borderRight: `1px solid ${theme.palette.border.lines}`,
              [`&.${tableCellClasses.head}`]: {
                backgroundColor: theme.palette.background.tabPanel,
                borderTop: `1px solid ${theme.palette.border.lines}`,
              }
            },
            '& .MuiTableRow-root .MuiTableCell-root:first-of-type': {
              borderLeft: `1px solid ${theme.palette.border.lines}`,
            },
          }}>
            {
              children
            }
          </Table>
        </ThemeProvider>
      </Box>
      {
        enableDownload &&
        <Box
          sx={{
            width: '100%',
            height: '40px',
            display: 'flex',
            flexDirection: 'row',
            marginTop: '12px',
            marginBottom: '12px',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}>
          <SplitButton defaultValue='xlsx' options={options} onClick={onClickDownload} />
        </Box>
      }
    </>
  )
}

const standardHtmlTags = ['a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup', 'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'keygen', 'label', 'legend', 'li', 'link', 'main', 'map', 'mark', 'menu', 'menuitem', 'meta', 'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'section', 'select', 'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u', 'ul', 'var', 'video', 'wbr'];

function isValidHTMLTag(tag) {
  return !!tag && standardHtmlTags.includes(tag.toLowerCase());
}

function extractFirstHTMLTag(str) {
  const match = str.match(/<([^>]+)>/);
  return match.length ? match[0] : null;
}

const Token = ({ markedToken, renderHtml, enableDownload }) => {
  const theme = useTheme()
  const { toastInfo } = useToast();
  const overrides = useCallback((tableData) => ({
    ...getOverrides(),
    ...MarkdownMapping,
    div: {
      component: StyledDiv,
      props: {},
    },
    table: {
      component: StyledTable,
      props: {
        tableRowData: tableData,
        enableDownload
      },
    },
  }), [enableDownload])
  const onCopyToEditor = useCallback(
    (code) => async () => {
      await navigator.clipboard.writeText(code);
      toastInfo('The code has been copied into clipboard');
    },
    [toastInfo],
  )
  if (markedToken.type == 'html' && !renderHtml) {
    markedToken.type = 'text'
    markedToken.raw = removeHTMLTags(markedToken.raw)
    markedToken.text = removeHTMLTags(markedToken.text)
  }
  switch (markedToken.type) {
    case 'code': {
      if (markedToken.lang) {
        return (
          <Highlight
            theme={theme.palette.mode === 'dark' ? themes.vsDark : themes.oneLight}
            code={markedToken.text}
            language={markedToken.lang}
          >
            {({ className, style = {}, tokens, getLineProps, getTokenProps }) => (
              <pre className={className} style={{ ...style, overflow: 'hidden', paddingRight: '8px', paddingBottom: '8px' }}>
                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', padding: '8px 0px 8px 8px' }}>
                  <Tooltip title='Copy code'>
                    <Box onClick={onCopyToEditor(markedToken.text)} sx={{ height: '24px', width: '24px', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}>
                      <ContentCopyIcon sx={{ fontSize: '16px', color: theme.palette.icon.fill.primary }} />
                    </Box>
                  </Tooltip>
                </Box>
                <Box sx={{ width: '100%', overflowX: 'scroll' }}>
                  {tokens.map((line, i) => (
                    <div key={i} {...getLineProps({ line })}>
                      <span>{' '}</span>
                      {line.map((token, key) => (
                        <span key={key} {...getTokenProps({ token })} />
                      ))}
                    </div>
                  ))}
                </Box>
              </pre>
            )}
          </Highlight>)
      } else {
        return (
          <MuiMarkdown
            options={{
              disableParsingRawHTML: true,
              overrides: overrides(markedToken.raw)
            }}
          >
            {markedToken.raw}
          </MuiMarkdown>
        )
      }
    }
    case 'text':
      return (
        <MuiMarkdown
          options={{
            disableParsingRawHTML: true,
            overrides: overrides(markedToken.raw)
          }}
        >
          {markedToken.raw}
        </MuiMarkdown>
      )
    case 'html': {
      try {
        const isValidHtml = isValidHTMLTag(extractFirstHTMLTag(markedToken.raw)?.slice(1, -1))
        return (
          <MuiMarkdown
            options={{
              disableParsingRawHTML: !isValidHtml,
              overrides: overrides(markedToken.raw)
            }}
          >
            {markedToken.raw}
          </MuiMarkdown>
        )
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('render html markdown error: ', error);
        return <MuiMarkdown
          options={{
            disableParsingRawHTML: true,
            overrides: overrides(markedToken.raw)
          }}
        >
          {markedToken.raw}
        </MuiMarkdown>
      }
      
    }
    case 'paragraph': {
      try {
        return markedToken.tokens?.length ? markedToken.tokens.map((token, idx) => <Token markedToken={token} key={idx} renderHtml={renderHtml} />) :
          <MuiMarkdown overrides={overrides(markedToken.raw)} >
            {markedToken.raw}
          </MuiMarkdown>
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('render paragraph markdown error: ', error);
        return <MuiMarkdown
          options={{
            disableParsingRawHTML: true,
            overrides: overrides(markedToken.raw)
          }}
        >
          {markedToken.raw}
        </MuiMarkdown>
      }
    }
    default:
      try {
        return (
          <MuiMarkdown overrides={overrides(markedToken.raw)} >
            {markedToken.raw}
          </MuiMarkdown>
        )
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('render default markdown error: ', error);
        return (
          <MuiMarkdown
            options={{
              disableParsingRawHTML: true,
              overrides: overrides(markedToken.raw)
            }}
          >
            {markedToken.raw}
          </MuiMarkdown>
        )
      }
  }
};

const Markdown = ({ children, renderHtml = true, enableDownload = true }) => {
  const theme = useTheme()
  const localGridTheme = useMemo(() => {
    return createTheme(theme, {});
  }, [theme]);
  let markedTokens;
  try {
    markedTokens = marked.lexer(children || '')
  } catch (error) {
    markedTokens = [{
      type: 'text',
      raw: 'there is some wild unparsable thing and only backend can see it',
      text: 'there is some wild unparsable thing and only backend can see it',
    }]
  }
  return <ThemeProvider theme={localGridTheme}>
    {markedTokens.map(
      (markedToken, index) => <Token markedToken={markedToken} key={index} renderHtml={renderHtml} enableDownload={enableDownload} />
    )}
  </ThemeProvider>
};

export default Markdown;
