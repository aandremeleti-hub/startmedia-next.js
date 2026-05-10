import Image from 'next/image'
import './style.css'

export const CardSitePrimary = ({ imagem, titulo, paragrafo, icone, item1, item2, item3, item4 }) => {
    return (
        <section className='content-card-site'>
            <div className='card-site'>
                <Image className="card-site-image" src={imagem} alt="" />

                <h1 className="card-site-title">{titulo}</h1>

                <p className="card-site-text">{paragrafo}</p>

                <div className="card-site-items">
                    <div className="card-site-column">
                        <div className="card-site-item">
                            <Image src={icone} alt="" />
                            <p>{item1}</p>
                        </div>
                        <div className="card-site-item">
                            <Image src={icone} alt="" />
                            <p>{item2}</p>
                        </div>
                    </div>

                    <div className="card-site-column">
                        <div className="card-site-item">
                            <Image src={icone} alt="" />
                            <p>{item3}</p>
                        </div>
                        <div className="card-site-item">
                            <Image src={icone} alt="" />
                            <p>{item4}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
