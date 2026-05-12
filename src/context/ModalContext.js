'use client'

import React, { createContext, useContext, useState } from 'react';
import { ModalDesign } from '../components/modals/modalDesign';
import { ModalSite } from '../components/modals/modalSite';
import { ModalIa } from '../components/modals/modalIa';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    const [modals, setModals] = useState({
        design: false,
        site: false,
        ia: false
    });

    const openModal = (name) => {
        setModals(prev => ({ ...prev, [name]: true }));
    };

    const closeModal = (name) => {
        setModals(prev => ({ ...prev, [name]: false }));
    };

    return (
        <ModalContext.Provider value={{ openModal, closeModal }}>
            {children}
            
            {/* Modais Globais */}
            <ModalDesign 
                open={modals.design} 
                onClose={() => closeModal('design')} 
            />
            <ModalSite 
                open={modals.site} 
                onClose={() => closeModal('site')} 
            />
            <ModalIa 
                open={modals.ia} 
                onClose={() => closeModal('ia')} 
            />
        </ModalContext.Provider>
    );
};

export const useModals = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModals must be used within a ModalProvider');
    }
    return context;
};
