import Image from 'next/image'
import './style.css'

export const CardSiteSecondary = ({ imagem, titulo, icone_seta, texto, icone_bola, item1, item2, item3, item4 }) => {
    return (
        <section className='content-secondary-card-site'>
            <Image className='secondary-card-image' src={imagem} alt="" />
            <div className='box-title-secondary-card-site'>
                <h2>{titulo}</h2>
                <Image className='image-title-secondary-card-site' src={icone_seta} alt="" />
            </div>
            <h3 className='text-secondary-card-site'>{texto}</h3>
            <div className='box-secondary-card-site-items'>
                <div className='secondary-card-site-items'>
                    <div className='card-site-left-items'>
                        <p>{item1}</p>
                    </div>
                    <div className='card-site-right-items'>
                        <p>{item2}</p>
                    </div>
                </div>
                <div className='secondary-card-site-items'>
                    <div className='card-site-left-items'>
                        <p>{item3}</p>
                    </div>
                    <div className='card-site-right-items'>
                        <p>{item4}</p>
                    </div>
                </div>
            </div>

        </section>
    )
}