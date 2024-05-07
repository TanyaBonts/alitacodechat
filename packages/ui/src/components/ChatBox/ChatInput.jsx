import { ChatTypes } from '@/common/constants';
import {
  ActionButton,
  ChatInputContainer,
  ParticipantContainer,
  SendButton,
  SendButtonContainer,
  StyledCircleProgress,
  StyledTextField,
  StyledUnfoldLessIcon,
  StyledUnfoldMoreIcon
} from '@/components/ChatBox/StyledComponents';
import { useCtrlEnterKeyEventsHandler } from '@/components/ChatBox/hooks';
import CommandIcon from '@/components/Icons/CommandIcon';
import DatabaseIcon from '@/components/Icons/DatabaseIcon';
import SendIcon from '@/components/Icons/SendIcon';
import SettingIcon from '@/components/Icons/SettingIcon';
import DataContext from '@/context/DataContext';
import { Box, IconButton, Typography, useTheme } from '@mui/material';
import { forwardRef, useCallback, useContext, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { UiMessageTypes, VsCodeMessageTypes } from 'shared';
import CancelIcon from '../Icons/CancelIcon';
import StyledTooltip from '../Tooltip';
import OptionPopper from './OptionPopper';
import { VariableDialog } from './VariableDialog';


const MAX_ROWS = 15;
const MIN_ROWS = 3;
const MIN_HEIGHT = 70;

const ChatInput = forwardRef(function ChatInput(props, ref) {
  const {
    onSend,
    isLoading,
    disabledSend,
    sx,
    placeholder = 'Type your message',
    clearInputAfterSubmit = true,
    chatWith,
    setChatWith,
    setParticipant,
  } = props;
  const {
    datasources,
    prompts,
    applications,
    postMessageToVsCode,
  } = useContext(DataContext);
  const theme = useTheme();
  const [question, setQuestion] = useState('');
  const [inputContent, setInputContent] = useState('');
  const [showExpandIcon, setShowExpandIcon] = useState(false);
  const [rows, setRows] = useState(MAX_ROWS);

  const reset = useCallback(() => {
    setInputContent('');
    setQuestion('');
    setShowExpandIcon(false);
  }, [])

  const [participantDetail, setParticipantDetail] = useState(null);
  const getParticipantDetail = useCallback((option) => {
    if (postMessageToVsCode && option) {
      if (chatWith) {
        const type = chatWith === ChatTypes.prompt ?
          VsCodeMessageTypes.getPromptDetail :
          chatWith === ChatTypes.datasource ?
            VsCodeMessageTypes.getDatasourceDetail :
            VsCodeMessageTypes.getApplicationDetail
        postMessageToVsCode({
          type,
          data: option.id
        });
      }
    }
  }, [chatWith, postMessageToVsCode])
  const [selectedOption, setSelectedOption] = useState(null);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const handleSelectOption = useCallback((option) => () => {
    setSelectedOption(option);
    setVariables([]);
    setParticipant({
      ...option,
      type: chatWith,
    })
    getParticipantDetail(option);
    reset();
  }, [getParticipantDetail, setParticipant, chatWith, reset]);

  useEffect(() => {
    if (!isLoading) {
      chatInputRef.current?.focus();
    }
  }, [isLoading]);

  useImperativeHandle(ref, () => ({
    reset: () => {
      setInputContent('');
      setQuestion('');
      setShowExpandIcon(false);
    },
    setValue: (value) => {
      setInputContent(value);
    }
  }));

  useEffect(() => {
    if (!postMessageToVsCode || !selectedOption) {
      setParticipantDetail(null);
      setParticipant(null)
    }
  }, [postMessageToVsCode, selectedOption, setParticipant]);

  const [variables, setVariables] = useState([]);
  const [open, setOpen] = useState(false);
  const onChangeVariable = useCallback((label, newValue) => {
    setVariables(prev => prev.map(item =>
      item.name === label ? { ...item, value: newValue } : item))
  }, [])
  const onCancel = useCallback(() => {
    setOpen(false);
  }, [])
  const openVariableDialog = useCallback(() => {
    setOpen(true);
  }, [])

  // Message Receiving from Extension
  useEffect(() => {
    const messageHandler = event => {
      const message = event.data;
      const detail = message.data
      setParticipant(prev => ({...prev, ...detail}))
      switch (message.type) {
        case UiMessageTypes.getPromptDetail:
          setParticipantDetail(detail);
          if (detail?.version_details.variables?.length > 0) {
            setVariables(detail?.version_details.variables)
            setOpen(true)
          }
          break;
        case UiMessageTypes.getDatasourceDetail:
          setParticipantDetail(detail);
          break;
        case UiMessageTypes.getApplicationDetail:
          setParticipantDetail(detail);
          if (detail?.version_details.variables?.length > 0) {
            setVariables(detail?.version_details.variables)
            setOpen(true)
          }
          break;
      }
    }

    window.addEventListener('message', messageHandler);

    return () => {
      window.removeEventListener('message', messageHandler);
    };
  }, [setParticipant]);

  const onClickExpander = useCallback(
    () => {
      setRows((prevRows) => prevRows === MAX_ROWS ? MIN_ROWS : MAX_ROWS);
    },
    [],
  );

  const chatInputRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const onDeleteChatWith = useCallback(() => {
    setChatWith(undefined);
    setAnchorEl(null);
    setFilteredOptions([]);
    setSelectedOption(null);
    setParticipant(null)
  }, [setChatWith, setParticipant]);

  const onInputQuestion = useCallback(
    (event) => {
      const value = event.target.value;
      const isPrompt = value.startsWith('/');
      const isDatasource = value.startsWith('#');
      const isApplication = value.startsWith('@');
      if (event.nativeEvent.inputType !== 'insertFromPaste' &&
        (isPrompt || isDatasource || isApplication)) {
        const filterString = value.substring(1).toLowerCase()
        const options = isPrompt ? prompts : isDatasource ? datasources : applications
        const optionList = options.filter((item) => item.name.toLowerCase().startsWith(filterString))
        if (optionList.length < 1) {
          // eslint-disable-next-line no-console
          console.log(`No ${isPrompt ? 'prompt' : 'datasource'} options available`)
        } else {
          setFilteredOptions(optionList.length ? optionList : options)
          setChatWith(isPrompt ? ChatTypes.prompt : isDatasource ? ChatTypes.datasource : ChatTypes.application)
          setAnchorEl(chatInputRef.current)
        }
      } else {
        setAnchorEl(null);
        setFilteredOptions([]);
      }
      setInputContent(value);
      setQuestion(value?.trim() ? value : '');
      setShowExpandIcon(event.target.offsetHeight > MIN_HEIGHT);
    },
    [applications, datasources, prompts, setChatWith],
  );

  const onCtrlEnterDown = useCallback(() => {

    setInputContent((prevContent) => prevContent + '\n');
  }, [])

  const onEnterDown = useCallback(() => {
    if (question.trim() && !disabledSend) {
      const sendData = { user_input: question };
      if (chatWith && selectedOption && participantDetail) {
        const latestVersionId = participantDetail.versions.find(v => v.name === 'latest')?.id
        if (latestVersionId) {
          sendData.currentVersionId = latestVersionId
        }
        if (chatWith === ChatTypes.prompt) {
          sendData.prompt_id = selectedOption.id
          sendData.variables = variables
        } else if (chatWith === ChatTypes.datasource) {
          sendData.datasource_id = selectedOption.id
          const chatSettings = participantDetail.version_details?.datasource_settings?.chat
          if (chatSettings) {
            sendData.context = participantDetail.version_details?.context
            sendData.chat_settings_embedding = chatSettings.chat_settings_embedding
            sendData.chat_settings_ai = chatSettings.chat_settings_ai
          }
        } else if (chatWith === ChatTypes.application) {
          sendData.application_id = selectedOption.id
          sendData.version_id = participantDetail.version_details?.id
          sendData.instructions = participantDetail.version_details?.instructions
          sendData.llm_settings = participantDetail.version_details?.llm_settings
          sendData.tools = participantDetail.version_details?.tools
          sendData.variables = variables
        }
      }
      onSend(sendData);
      if (clearInputAfterSubmit) {
        setTimeout(() => {
          setInputContent('');
          setQuestion('');
        }, 0);
        setShowExpandIcon(false);
      }
    }
  }, [question, disabledSend, chatWith, selectedOption, participantDetail, onSend, clearInputAfterSubmit, variables]);

  const { onKeyDown, onCompositionStart, onCompositionEnd } = useCtrlEnterKeyEventsHandler({
    onCtrlEnterDown,
    onEnterDown,
  });

  useEffect(() => {
    if (!showExpandIcon) {
      setRows(MAX_ROWS);
    }
  }, [showExpandIcon]);

  return (
    <Box flex='0 0 auto'>
      {selectedOption &&
        <ParticipantContainer >
          <Box display='flex' alignItems='center' gap='8px'>
            {chatWith === ChatTypes.prompt && <CommandIcon fontSize="1rem" />}
            {chatWith === ChatTypes.datasource && <DatabaseIcon fontSize="1rem" />}
            <Typography variant='labelSmall'>{selectedOption?.name}</Typography>
            {variables.length > 0 &&
              <StyledTooltip title={'Settings'} placement="top">
                <ActionButton onClick={openVariableDialog}>
                  <SettingIcon sx={{ fontSize: '1.13rem' }} color="icon" />
                </ActionButton>
              </StyledTooltip>}
          </Box>
          <IconButton
            size='small'
            onClick={onDeleteChatWith}
          >
            <CancelIcon />
          </IconButton>
        </ParticipantContainer>}

      <OptionPopper
        anchorEl={anchorEl}
        setAnchorEl={setAnchorEl}
        options={filteredOptions}
        handleSelect={handleSelectOption}
      />

      <VariableDialog
        variables={variables}
        open={open}
        setOpen={setOpen}
        onChangeVariable={onChangeVariable}
        onCancel={onCancel}
      />

      <ChatInputContainer sx={sx} >
        <Box sx={{ flex: 1, marginRight: 1 }}>
          <StyledTextField
            inputRef={chatInputRef}
            value={inputContent}
            fullWidth
            id="standard-multiline-static"
            label=""
            multiline
            maxRows={rows}
            variant="standard"
            onChange={onInputQuestion}
            onKeyDown={onKeyDown}
            onCompositionStart={onCompositionStart}
            onCompositionEnd={onCompositionEnd}
            disabled={isLoading}
            placeholder={placeholder}
            InputProps={{
              style: { color: theme.palette.text.secondary },
              disableUnderline: true,
              endAdornment: showExpandIcon ? (
                <IconButton
                  size='small'
                  onClick={onClickExpander}
                >
                  {rows === MAX_ROWS ? (
                    <StyledUnfoldLessIcon />
                  ) : (
                    <StyledUnfoldMoreIcon />
                  )}
                </IconButton>
              ) : null
            }}
          />
        </Box>
        <SendButtonContainer>
          <SendButton
            disabled={disabledSend || !question}
            onClick={onEnterDown}
            aria-label="send your question">
            <SendIcon sx={{ fontSize: 18, fill: 'icon.fill.send' }} />
          </SendButton>
          {isLoading && <StyledCircleProgress />}
        </SendButtonContainer>
      </ChatInputContainer>
    </Box>
  )
});

ChatInput.propTypes = {
}


export default ChatInput;