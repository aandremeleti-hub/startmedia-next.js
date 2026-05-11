'use client'
import './style.css'
import Modal from '@mui/material/Modal'
import iconeSetaModalWhite from '../../../assets/images/home/icone_seta_modal_white.svg'
import modalDesignImage from '../../../assets/images/home/modal_design_image.svg'
import design_icon from '../../../assets/images/home/design_icon.svg'
import logo from '../../../assets/images/home/logo.svg'
import Link from 'next/link'
import Image from 'next/image'

export const ModalDesign = ({ open, onClose }) => {
    return (
        <Modal
            open={open}
            onClose={onClose}
            slotProps={{
                backdrop: {
                    style: {
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        backgroundColor: 'rgba(8, 8, 8, 0.75)',
                    }
                }
            }}
        >
            <div className="modal-content-design">

                {/* Coluna Esquerda — Imagem de capa */}
                <div className="modal-image-col-design">
                    <Image
                        src={modalDesignImage}
                        alt="Design de alta performance pela StartMedia"
                        fill
                        style={{ objectFit: 'cover' }}
                    />
                </div>

                {/* Coluna Direita — Conteúdo informativo */}
                <div className="modal-info-content-design">

                    <div className="modal-info-top-row-design">
                        {/* Título com ícone */}
                        <div className="container-modal-title-design">
                            <Image src={design_icon} alt="Ícone de Design" width={52} height={52} />
                            <h2>Design</h2>
                        </div>

                        {/*
                          * Logo em fluxo normal — alinhado à direita via flex row.
                          * Não usa position: absolute. Nunca sobrepõe a imagem.
                        */}
                        <div className="modal-info-header-design">
                            <Image
                                src={logo}
                                alt="StartMedia"
                                width={110}
                                height={32}
                                className="modal-logo-design"
                                style={{ objectFit: 'contain' }}
                            />
                        </div>
                    </div>

                    {/* Copy persuasiva */}
                    <p className="modal-description-design">
                        Sua marca merece mais que o comum. A StartMedia cria identidades visuais premium com portfólio diferenciado, elevando sua autoridade no mercado. Design estratégico que atrai, converte e transforma a percepção do seu negócio.
                    </p>

                    {/* CTA — Botão animado com reveal de 6s + bounce infinito */}
                    <div className="container-modal-cta-design">
                        <Link
                            href="/design"
                            onClick={onClose}
                            className="btn-modal-design"
                            aria-label="Saiba mais sobre o serviço de design da StartMedia"
                        >
                            <Image src={iconeSetaModalWhite} alt="" width={22} height={22} aria-hidden="true" />
                            Saiba mais
                        </Link>
                    </div>

                </div>
            </div>
        </Modal>
    )
}
