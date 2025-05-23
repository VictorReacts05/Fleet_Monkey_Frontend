import React from 'react';
import { Dialog, DialogContent } from '@mui/material';
import ProjectParameterForm from './ProjectParameterForm';

const ProjectParameterModal = ({ open, onClose, parameterId, onSave }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent>
        <ProjectParameterForm
          open={open}
          parameterId={parameterId}
          onClose={onClose}
          onSave={onSave}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ProjectParameterModal;