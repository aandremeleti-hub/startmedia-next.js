'use client'
import './style.css'
import Modal from '@mui/material/Modal'
import iconeSetaModal from '../../../assets/images/home/icone_seta_modal.svg'
import modalIaImage from '../../../assets/images/home/modal_ia_image.svg'
import ia_icon from '../../../assets/images/home/ia_icon.svg'
import Image from 'next/image'

export const ModalIa = ({ open, onClose }) => {
    return (
        <Modal open={open} onClose={onClose}>
            <div className="modal-content-ia">
                <Image className='modal-ia-image' src={modalIaImage} alt="" />
                <div className='modal-info-content-ia'>
                    <div className='container-modal-title-design'>
                        <Image src={ia_icon} alt="" />
                        <h2>Atendimento com IA</h2>
                    </div>
                    <p>James Maitland Stewart (May 20, 1908 – July 2, 1997) was an American actor and military pilot. Known for his distinctive drawl and everyman screen persona, Stewart's film career spanned 80 films from 1935 to 1991. With the strong morality he portrayed both on and off the screen, he epitomized the "American ideal" in the.</p>
                    <div>
                        <Image src={iconeSetaModal} alt="" />
                        <a href="">Saiba mais</a>
                    </div>
                </div>
            </div>
        </Modal>

    )
}


