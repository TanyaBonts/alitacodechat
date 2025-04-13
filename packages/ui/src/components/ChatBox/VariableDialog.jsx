import {
  StyledConfirmButton,
  StyledDialog,
  StyledDialogActions,
} from '@/components/StyledDialog';
import VariableList from '@/pages/Prompts/Components/Form/VariableList';
import {
  Box,
  DialogContent,
  DialogTitle,
  Typography
} from '@mui/material';
import React from "react";
import VersionSelect from "@/pages/Prompts/Components/Form/VersionSelect.jsx";

export function VariableDialog({
  open,
  detail,
  onChangeVariable,
  onChangeVersion,
  onCancel,
}) {

  return (
    <StyledDialog
      open={open}
      onClose={onCancel}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        <Typography variant='headingSmall'>
          {detail.name}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{
        width: '100%',
        maxHeight: '400px',
        overflow: 'auto',
      }}>
        <Box sx={{ display: 'flex'}}>
          <VersionSelect
            currentVersionId={detail.version_details.id}
            versions={detail.versions}
            onSelectVersion={onChangeVersion}
          />
        </Box>
      </DialogContent>
      {detail.version_details.variables?.length > 0 &&
        <>
          <DialogTitle id="alert-dialog-title">
            <Typography variant='headingSmall'>Variables</Typography>
          </DialogTitle>
          <DialogContent sx={{
            width: '100%',
            maxHeight: '400px',
            overflow: 'auto',
          }}>
            <VariableList
              variables={detail.version_details.variables}
              onChangeVariable={onChangeVariable}
              showexpandicon='true'
              multiline
              collapseContent
            />
          </DialogContent>
        </>
      }
      <StyledDialogActions>
        <StyledConfirmButton danger onClick={onCancel} disableRipple>OK</StyledConfirmButton>
      </StyledDialogActions>
    </StyledDialog>
  )
}