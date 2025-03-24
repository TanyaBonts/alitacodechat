import React from 'react';
import { Box, Button, ButtonGroup, ClickAwayListener, Grow, MenuList, Paper, Popper, Typography } from '@mui/material';
import ArrowDownIcon from './Icons/ArrowDownIcon';
import { useTheme } from '@emotion/react';
import { StyledMenuItem, StyledMenuItemIcon } from './SingleSelect';
// import CheckedIcon from "@/components/Icons/CheckedIcon.jsx";
import CheckedIcon from '@/assets/checked-icon.svg?react'
import { styled } from '@mui/material/styles';

const StyledButtonGroup = styled(ButtonGroup)(() => (`
    border-radius: 14px;
    height: '28px',
`))

export const StyledMenuList = styled(MenuList)(({theme}) => ({
  '& .MuiMenuItem-root': {
    fontSize: '14px',
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: '24px',
    padding: '8px 20px 8px 20px',

    '&:hover': {
      backgroundColor: theme.palette.background.select.hover,
    },

    '&.Mui-selected': {
      backgroundColor: theme.palette.background.select.selected.default,
    },

    '&.Mui-selected:hover': {
      backgroundColor: theme.palette.background.select.selected.hover,
    },
  }
}))

export default function SplitButton({ defaultValue = '', options = [], onClick }) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);
  const [selectedOption, setSelectedOption] = React.useState(options.find(option => option.value === defaultValue))

  const handleToggle = React.useCallback(() => {
    setOpen((prevOpen) => !prevOpen);
  }, []);

  const handleClose = React.useCallback((event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  }, []);

  const onClickOption = React.useCallback((option) => (event) => {
    handleClose(event);
    setSelectedOption(option)
    onClick(option.value);
  }, [handleClose, onClick])

  return (
    <>
      <ClickAwayListener onClickAway={handleClose}>
        <Box>
          <StyledButtonGroup sx={{
            '.MuiButtonGroup-grouped': {
              borderRightColor: `${theme.palette.border.category.selected} !important`,
            },
            '.MuiButtonGroup-grouped.MuiButtonGroup-firstButton': {
              borderRightColor: `${theme.palette.border.category.selected} !important`,
            },
          }} variant="contained" ref={anchorRef} aria-label="split button">
            <Button
              variant='alita'
              disableRipple sx={{ marginRight: '0px' }}
              color='secondary'
              onClick={onClickOption(selectedOption)}
            >
              {selectedOption.label}
            </Button>
            <Button
              variant='alita'
              disableRipple
              sx={{ marginRight: '0px' }}
              color='secondary'
              aria-controls={open ? 'split-button-menu' : undefined}
              aria-expanded={open ? 'true' : undefined}
              aria-label="select merge strategy"
              aria-haspopup="menu"
              onClick={handleToggle}
            >
              <ArrowDownIcon />
            </Button>
          </StyledButtonGroup>
          <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
            {({ TransitionProps, placement }) => (
              <Grow
                {...TransitionProps}
                style={{
                  transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
                }}
              >
                <Paper sx={{
                  color: 'secondary',
                  background: theme.palette.background.secondary
                }}>
                  <StyledMenuList id="split-button-menu">
                    {
                      options.map(({ label, value }) => (
                        <StyledMenuItem
                          selected={selectedOption.value === value}
                          key={value}
                          // sx={{
                          //   background: selectedOption.value === value ? theme.palette.background.participant.active : undefined
                          // }}
                          onClick={onClickOption({ label, value })}>
                          <Typography color='text.secondary' variant='bodyMedium'>
                            {label}
                          </Typography>
                          {selectedOption.value === value && (
                            <StyledMenuItemIcon>
                              <CheckedIcon />
                            </StyledMenuItemIcon>
                          )}
                        </StyledMenuItem>)
                      )
                    }
                  </StyledMenuList>
                </Paper>
              </Grow>
            )}
          </Popper>
        </Box>
      </ClickAwayListener>
    </>
  );
}