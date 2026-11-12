import { SectionHeading } from './Shared';

// Os temas são fixos: descrevem os campos de interesse da liga, não itens do painel.
export function ResearchFields() {
  return (
    <section className="shell section-space research-fields">
      <SectionHeading
        label="Temas que dialogam com a liga"
        title="Da cibersegurança aos sistemas conectados."
      />
      <div className="research-field-grid">
        <div className="research-field" data-reveal>
          <span className="field-code">SEC</span>
          <h2>Segurança digital</h2>
          <p>
            Aplicações, redes e práticas para ambientes digitais mais seguros.
          </p>
        </div>
        <div className="research-field" data-reveal>
          <span className="field-code">IA</span>
          <h2>Inteligência artificial</h2>
          <p>
            Aprendizado de máquina, visão computacional e uso responsável de
            dados.
          </p>
        </div>
        <div className="research-field" data-reveal>
          <span className="field-code">IOT</span>
          <h2>Sistemas conectados</h2>
          <p>
            Dispositivos, sensores e os desafios de segurança da Internet das
            Coisas.
          </p>
        </div>
        <div className="research-field" data-reveal>
          <span className="field-code">PRIV</span>
          <h2>Privacidade</h2>
          <p>
            Proteção de dados, responsabilidade e ética em sistemas digitais.
          </p>
        </div>
      </div>
    </section>
  );
}
