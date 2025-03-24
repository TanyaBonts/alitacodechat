import {useCallback, useRef, useState, useEffect, useContext} from 'react'
import { v4 as uuidv4 } from 'uuid';
import DataContext from "@/context/DataContext.jsx";


export const useInteractionUUID = () => {
  const firstRenderUUID = useRef(true)
  const [interaction_uuid, setInteractionUUID] = useState('')

  useEffect(() => {
    if (firstRenderUUID.current) {
      firstRenderUUID.current = false;
      if (!interaction_uuid) {
        setInteractionUUID(uuidv4())
      }
    }
  }, [interaction_uuid])
  return {
    interaction_uuid,
    setInteractionUUID,
    firstRenderUUID
  }
}

export default function useMonitorOnCopyEvent({ interaction_uuid, onCopy, onDownload }) {
  const { providerConfig } = useContext(DataContext);

  const onMonitorCopy = useCallback(
    (_event, copyEvent = 'manual_copy') => {
      fetch(`${providerConfig.apiUrl}/monitoring_hub/acceptance/default/${providerConfig.projectId}`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'Authorization': `Bearer ${providerConfig.token}`,
        },
        body: JSON.stringify({interaction_uuid, acceptance_event: copyEvent}),
      })
        .then(response => response.ok || console.warn(`Unsuccessful response (status: ${response.status}) for monitoring request on copy event.`))
        .catch(reason => console.warn('Failed to send monitoring request on copy event.', reason));
    },
    [interaction_uuid, providerConfig],
  )

  const onClickCopy = useCallback(
    () => {
      onCopy && onCopy()
      onMonitorCopy(null, 'button_copy')
    },
    [onCopy, onMonitorCopy],
  )
  
  const onClickDownload = useCallback(
    (params) => {
      onDownload && onDownload(params)
      if (interaction_uuid) {
        onMonitorCopy(null, 'download')
      }
    },
    [interaction_uuid, onDownload, onMonitorCopy],
  )
  
  return {
    onMonitorCopy,
    onClickCopy,
    onClickDownload
  }
}