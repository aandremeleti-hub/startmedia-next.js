'use client'
import './style.css'
import Modal from '@mui/material/Modal'
import iconeSetaModalWhite from '../../../assets/images/home/icone_seta_modal_white.svg'
import modalIaImage from '../../../assets/images/home/modal_ia_image.svg'
import ia_icon from '../../../assets/images/home/ia_icon.svg'
import logo from '../../../assets/images/home/logo.svg'
import Link from 'next/link'
import Image from 'next/image'

export const ModalIa = ({ open, onClose }) => {
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
            <div className="modal-content-ia">

                {/* Coluna Esquerda — Imagem de capa */}
                <div className="modal-image-col-ia">
                    <Image
                        src={modalIaImage}
                        alt="Atendimento com IA pela StartMedia"
                        fill
                        style={{ objectFit: 'cover' }}
                    />
                </div>

                {/* Coluna Direita — Conteúdo informativo */}
                <div className="modal-info-content-ia">

                    <div className="modal-info-top-row-ia">
                        {/* Título com ícone */}
                        <div className="container-modal-title-ia">
                            <Image src={ia_icon} alt="Ícone de IA" width={52} height={52} />
                            <h2>Atendimento com IA</h2>
                        </div>

                        {/*
                          * Logo em fluxo normal — alinhado à direita via flex row.
                          * Não usa position: absolute. Nunca sobrepõe a imagem.
                        */}
                        <div className="modal-info-header-ia">
                            <Image
                                src={logo}
                                alt="StartMedia"
                                width={110}
                                height={32}
                                className="modal-logo-ia"
                                style={{ objectFit: 'contain' }}
                            />
                        </div>
                    </div>

                    {/* Copy persuasiva */}
                    <p className="modal-description-ia">
                        Sua empresa nunca mais perderá um lead. Com nossos agentes de IA, seu atendimento funciona 24h por dia, qualificando e agendando clientes com a naturalidade de um humano. Automatize processos, reduza custos e garanta que cada interação se torne uma oportunidade de venda.
                    </p>

                    {/* CTA — Botão animado com reveal de 6s + bounce infinito */}
                    <div className="container-modal-cta-ia">
                        <Link
                            href="/ia"
                            onClick={onClose}
                            className="btn-modal-ia"
                            aria-label="Saiba mais sobre o serviço de IA da StartMedia"
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
