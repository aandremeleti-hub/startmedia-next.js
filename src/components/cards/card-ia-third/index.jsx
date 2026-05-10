import Image from 'next/image'
import './style.css'

export const CardIaThird = ({linha, aspas, titulo, nome, cargo}) => {
    return (
        <div className='content-card-ia-third'>
            <div className='container-card-ia-third'>
                <Image className='line-image-container-card-ia-third' src={linha} alt="" />
                <Image src={aspas} alt="" />
                <Image className='line-image-container-card-ia-third' src={linha} alt="" />
            </div>
            <h1 className='title-card-ia-third'>{titulo}</h1>
            <div className='container-name-card-ia-third'>
                <h2>{nome}</h2>
                <h3>{cargo}</h3>
            </div>
        </div>
    )
}