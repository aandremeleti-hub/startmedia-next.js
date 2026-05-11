'use client'
import './style.css'
import Modal from '@mui/material/Modal'
import iconeSetaModalWhite from '../../../assets/images/home/icone_seta_modal_white.svg'
import modalSiteImage from '../../../assets/images/home/modal_site_image.svg'
import site_icon from '../../../assets/images/home/site_icon.svg'
import logo from '../../../assets/images/home/logo.svg'
import Link from 'next/link'
import Image from 'next/image'

export const ModalSite = ({ open, onClose }) => {
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
            <div className="modal-content-site">

                {/* Coluna Esquerda — Imagem de capa */}
                <div className="modal-image-col-site">
                    <Image
                        src={modalSiteImage}
                        alt="Criação de Sites pela StartMedia"
                        fill
                        style={{ objectFit: 'cover' }}
                    />
                </div>

                {/* Coluna Direita — Conteúdo informativo */}
                <div className="modal-info-content-site">

                    <div className="modal-info-top-row-site">
                        {/* Título com ícone */}
                        <div className="container-modal-title-site">
                            <Image src={site_icon} alt="Ícone de Site" width={52} height={52} />
                            <h2>Site e landing page</h2>
                        </div>

                        {/*
                          * Logo em fluxo normal — alinhado à direita via flex row.
                          * Não usa position: absolute. Nunca sobrepõe a imagem.
                        */}
                        <div className="modal-info-header-site">
                            <Image
                                src={logo}
                                alt="StartMedia"
                                width={110}
                                height={32}
                                className="modal-logo-site"
                                style={{ objectFit: 'contain' }}
                            />
                        </div>
                    </div>

                    {/* Copy persuasiva */}
                    <p className="modal-description-site">
                        Não apenas um site, mas uma máquina de vendas de alta performance. Desenvolvemos landing pages e portais institucionais focados em conversão, velocidade e autoridade visual. Coloque sua empresa no mapa digital com uma estrutura moderna, otimizada para SEO e pronta para escalar.
                    </p>

                    {/* CTA — Botão animado com reveal de 6s + bounce infinito */}
                    <div className="container-modal-cta-site">
                        <Link
                            href="/site"
                            onClick={onClose}
                            className="btn-modal-site"
                            aria-label="Saiba mais sobre criação de sites da StartMedia"
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
