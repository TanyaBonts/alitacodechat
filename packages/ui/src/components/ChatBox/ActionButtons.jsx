import StopCircleOutlinedIcon from '@mui/icons-material/StopCircleOutlined';
import StyledTooltip from '../Tooltip';
import AutoScrollToggle from './AutoScrollToggle';
import {
  ActionButton
} from './StyledComponents';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';

export default function ActionButtons({
  isStreaming,
  onStopAll,
  onRefresh,
}) {
  return (
    <>
      {isStreaming &&
        <StyledTooltip title={'Stop generating'} placement="top">
          <ActionButton onClick={onStopAll}>
            <StopCircleOutlinedIcon sx={{ fontSize: '1.13rem' }} color="icon" />
          </ActionButton>
        </StyledTooltip>}
      <StyledTooltip title={'Reload Elitea Code settings, prompt and datasource options'} placement="top">
        <ActionButton onClick={onRefresh}>
          <RefreshOutlinedIcon sx={{ fontSize: '1.13rem' }} color="icon" />
        </ActionButton>
      </StyledTooltip>
      <AutoScrollToggle />
    </>
  )
}