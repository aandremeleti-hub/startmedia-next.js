import "./footer.css"
import logo from "../../../assets/images/home/logo.svg"
import Image from "next/image"

export const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-brand">
                    <Image src={logo} alt="STARTMEDIA" className="footer-logo-img" />
                    <p className="footer-tagline">
                        Facilitamos a sua vida com soluções integradas em marketing, 
                        automação e inteligência artificial. Estrutura digital completa 
                        focada em resultados reais.
                    </p>
                    <div className="footer-social">
                        <a href="#" className="social-icon" aria-label="Instagram">
                            <i className="fab fa-instagram"></i>
                        </a>
                        <a href="#" className="social-icon" aria-label="WhatsApp">
                            <i className="fab fa-whatsapp"></i>
                        </a>
                        <a href="mailto:contato@startmedia.com.br" className="social-icon" aria-label="E-mail">
                            <i className="fas fa-envelope"></i>
                        </a>
                    </div>
                </div>

                <div className="footer-column">
                    <h4>Navegação</h4>
                    <ul className="footer-links">
                        <li><a href="/">Home</a></li>
                        <li><a href="/design">Design Estratégico</a></li>
                        <li><a href="/site">Sites & LPs</a></li>
                        <li><a href="/ia">Atendimento IA</a></li>
                    </ul>
                </div>

                <div className="footer-column">
                    <h4>Serviços</h4>
                    <ul className="footer-links">
                        <li><a href="/ia">Agentes de IA</a></li>
                        <li><a href="/ia">Sites & LP's</a></li>
                        <li><a href="/site">Criação de Interfaces</a></li>
                        <li><a href="/design">Identidade Visual</a></li>
                        <li><a href="#">Estratégias de Mídia</a></li>
                        <li><a href="#">Criação de Conteúdo</a></li>
                        <li><a href="#">Pesquisa de Mercado</a></li>
                        <li><a href="#">Catálogos Digitais</a></li>
                    </ul>
                </div>

                <div className="footer-contact">
                    <h4>Fale Conosco</h4>
                    <p className="footer-tagline-cta" style={{ marginBottom: '10px' }}>
                        Pronto para colocar sua empresa no mapa digital?
                    </p>
                    <a href="https://wa.me/5500000000000" className="footer-cta">
                        Quero alavancar <br />meu negócio
                    </a>
                    <ul className="footer-links" style={{ marginTop: '10px' }}>
                        <li><a href="mailto:contato@startmedia.com.br">contato@startmedia.com.br</a></li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {currentYear} STARTMEDIA. Todos os direitos reservados.</p>
                <div className="footer-bottom-links">
                    <a href="#">Política de Privacidade</a>
                    <a href="#">Termos de Uso</a>
                </div>
            </div>
        </footer>
    );
};