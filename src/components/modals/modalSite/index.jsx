'use client'
import './style.css'
import Modal from '@mui/material/Modal'
import iconeSetaModal from '../../../assets/images/home/icone_seta_modal.svg'
import modalSiteImage from '../../../assets/images/home/modal_site_image.svg'
import site_icon from '../../../assets/images/home/site_icon.svg'
import Link from 'next/link'
import Image from 'next/image'

export const ModalSite = ({ open, onClose }) => {
    return (
        <Modal open={open} onClose={onClose}>
            <div className="modal-content-site">
                <Image className="modal-site-image" src={modalSiteImage} alt="" />
                <div className='modal-info-content-site'>
                    <div>
                        <Image src={site_icon} alt="" />
                        <h2>Site e landing page</h2>
                    </div>
                    <p>James Maitland Stewart (May 20, 1908 – July 2, 1997) was an American actor and military pilot. Known for his distinctive drawl and everyman screen persona, Stewart's film career spanned 80 films from 1935 to 1991. With the strong morality he portrayed both on and off the screen, he epitomized the "American ideal" in the. </p>
                    <div className='teste'>
                        <Image src={iconeSetaModal} alt="" />
                        <Link href='/site' onClick={onClose}>
                            Saiba mais
                        </Link>
                    </div>
                </div>
            </div>
        </Modal>

    )
}


