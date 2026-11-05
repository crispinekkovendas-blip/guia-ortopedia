/*
 * A "cola" do plantão de ortopedia: os textos prontos que o médico usa todo
 * dia — o prontuário por queixa (história, exame, conduta), a receita para
 * casa, a medicação intramuscular, as doses da pediatria, as incidências do
 * raio-X e as notas de luxação, sutura, trauma e fratura exposta. Vem do
 * caderno do próprio médico (dontpad ISORTOP, 2026-11-05), em caixa alta como
 * ele escreve no prontuário; aqui só se tira o que era específico de um
 * paciente. Cada texto copia inteiro com um toque.
 */

export type ColaGroup = "prontuario" | "receita" | "im" | "notas" | "raio-x";

export interface ColaEntry {
  id: string;
  group: ColaGroup;
  title: string;
  /** CID como ele anota ("M54.4/5"). */
  cid?: string;
  /** O tópico do guia a que a cola pertence (aparece no fim do tópico). */
  topic?: string;
  /** Uma linha de contexto, quando o título não basta. */
  hint?: string;
  text: string;
}

export const COLA_GROUPS: { id: ColaGroup; label: string; hint: string }[] = [
  { id: "prontuario", label: "Prontuário por queixa", hint: "história, exame e conduta prontos — troque o lado, o CID e o que for do paciente" },
  { id: "receita", label: "Receita para casa", hint: "os esquemas que saem do PS de ortopedia; adulto sem comorbidade" },
  { id: "im", label: "Medicação na unidade", hint: "intramuscular e venosa de uso imediato" },
  { id: "notas", label: "Notas de urgência", hint: "luxação, sutura, trauma do SAMU, fratura exposta e os mecanismos de fratura" },
  { id: "raio-x", label: "Incidências do raio-X", hint: "o que pedir por região" },
];

const IM = `USO IMEDIATO - INTRAMUSCULAR:

DICLOFENACO ----------------------- 01 AMPOLA IM
DEXAMETASONA ---------------------- 01 AMPOLA IM
DIPIRONA -------------------------- 01 AMPOLA IM`;

const GELO = `OBS: APLICAR COMPRESSA DE GELO NA REGIÃO POR 15–20 MINUTOS, 3–4 VEZES AO DIA, SEMPRE PROTEGENDO A PELE COM UM PANO. EVITAR APLICAR DIRETAMENTE NA PELE E NÃO ULTRAPASSAR 20 MINUTOS.`;

export const COLA: ColaEntry[] = [
  // ---------- prontuário por queixa ----------
  {
    id: "pront-lombalgia",
    group: "prontuario",
    title: "Lombalgia aguda",
    cid: "M54.4/5",
    topic: "lombalgia-aguda",
    text: `PACIENTE COM LOMBALGIA APÓS ESFORÇO FÍSICO. SEM HISTÓRIA DE TRAUMA RECENTE.
NEGA ALERGIAS E COMORBIDADES.

PCTE BEG, HIDRATADO, CORADO, ACIANÓTICO, ANICTÉRICO, AFEBRIL E EUPNEICO.
DOR À PALPAÇÃO DE MUSCULATURA PARAVERTEBRAL LOMBAR, ADM LIMITADA E DOLOROSA.
SEM PARESTESIA DE MMII, NEGA FEBRE, DOR ABDOMINAL E OUTROS SINTOMAS. LASÈGUE -, GIORDANO -,
SEM DÉFICIT NEUROVASCULAR E COM BOA PERFUSÃO PERIFÉRICA, SEM SINAIS DE IRRITAÇÃO MENÍNGEA.

CD: ORIENTAÇÕES GERAIS AO PACIENTE, ANALGESIA E SEGUIMENTO AMBULATORIAL.

${IM}`,
  },
  {
    id: "pront-cervicalgia",
    group: "prontuario",
    title: "Cervicalgia",
    cid: "M54.2",
    topic: "cervicalgia-e-cervicobraquialgia",
    text: `PACIENTE COM CERVICALGIA, SEM HISTÓRIA DE TRAUMA RECENTE. NEGA FEBRE, CEFALEIA, NÁUSEAS, VÔMITOS OU OUTROS SINTOMAS.
NEGA ALERGIAS E COMORBIDADES.

APRESENTA LASÈGUE -, GIORDANO -, LHERMITTE - E VALSALVA -, APRESENTA CONTRATURA DE TRAPÉZIO,
SEM PARESTESIA DE MMSS.
SEM DÉFICIT NEUROVASCULAR E COM BOA PERFUSÃO PERIFÉRICA, SEM SINAIS DE IRRITAÇÃO MENÍNGEA.

CD: ORIENTAÇÕES GERAIS AO PACIENTE, ANALGESIA E SEGUIMENTO AMBULATORIAL.

${IM}`,
  },
  {
    id: "pront-entorse-tnz-aguda",
    group: "prontuario",
    title: "Entorse de tornozelo aguda",
    cid: "S93.4",
    topic: "entorse-de-tornozelo",
    text: `PACIENTE REFERE ENTORSE DE TORNOZELO, COM DOR E EDEMA LOCAL.
NEGA ALERGIAS E COMORBIDADES.

EDEMA LOCAL LEVE, SEM EQUIMOSE OU HEMATOMAS, ADM DOLOROSA E LIVRE, DEAMBULANDO COM CARGA TOTAL.
SEM DOR À PALPAÇÃO DE EXTREMIDADES ÓSSEAS, SEM DÉFICITS NEUROVASCULARES E COM BOA PERFUSÃO PERIFÉRICA.
THOMPSON -.

CD: RX + ANALGESIA + REAVALIAÇÃO.
ORIENTAÇÕES GERAIS AO PACIENTE, ANALGESIA E SEGUIMENTO AMBULATORIAL.

${IM}`,
  },
  {
    id: "pront-entorse-tnz-cronica",
    group: "prontuario",
    title: "Entorse de tornozelo crônica",
    cid: "S93.4",
    topic: "entorse-de-tornozelo",
    text: `PACIENTE REFERE ENTORSE DE TORNOZELO CRÔNICA, COM DOR PERSISTENTE AOS ESFORÇOS.
NEGA ALERGIAS E COMORBIDADES.

SEM DOR À PALPAÇÃO ÓSSEA, SEM DÉFICITS NEUROVASCULARES E COM BOA PERFUSÃO PERIFÉRICA.
AUSÊNCIA DE EDEMA OU EQUIMOSE, COM ADM TOTAL E SEM SINAIS FLOGÍSTICOS. DEAMBULANDO COM CARGA TOTAL.

CD: ORIENTAÇÕES GERAIS AO PACIENTE, ANALGESIA E SEGUIMENTO AMBULATORIAL.

${IM}`,
  },
  {
    id: "pront-trauma-agudo",
    group: "prontuario",
    title: "Trauma agudo (contusão)",
    cid: "S60 mão · S90 pé",
    hint: "complete o local do trauma",
    text: `TRAUMA DIRETO EM ______, COM DOR LOCAL E EDEMA.
NEGA ALERGIAS E COMORBIDADES.

EDEMA LOCAL, SEM DESVIOS OU CREPITAÇÕES, ADM DOLOROSA, SEM DÉFICIT NEUROVASCULAR, BPP, PULSOS PALPÁVEIS E SIMÉTRICOS. SEM SINAIS DE SÍNDROME COMPARTIMENTAL.

CD: RX + ANALGESIA + REAVALIAÇÃO.
ORIENTAÇÕES GERAIS AO PACIENTE, ANALGESIA E SEGUIMENTO AMBULATORIAL.

CID MÃO: S60
CID PÉ: S90

${IM}`,
  },
  {
    id: "pront-ombro-tendinite",
    group: "prontuario",
    title: "Ombro — tendinite",
    cid: "M75",
    topic: "sindrome-do-impacto-e-manguito-rotador",
    text: `DOR EM OMBRO, SEM HISTÓRIA DE TRAUMA RECENTE.
NEGA ALERGIAS E COMORBIDADES.

DOR DIFUSA, TESTES DE IMPACTO + COM ADM DOLOROSA.
SEM DÉFICITS NEUROVASCULARES E COM BOA PERFUSÃO PERIFÉRICA, SEM IRRADIAÇÃO OU PARESTESIA EM MMSS. AUSÊNCIA DE EDEMAS OU EQUIMOSE.

CD: ORIENTAÇÕES GERAIS AO PACIENTE, ANALGESIA E SEGUIMENTO AMBULATORIAL.

${IM}`,
  },
  {
    id: "pront-cotovelo-epicondilite",
    group: "prontuario",
    title: "Cotovelo — epicondilite",
    cid: "M77",
    topic: "epicondilite",
    text: `DOR EM COTOVELO, SEM HISTÓRIA DE TRAUMA RECENTE.
NEGA ALERGIAS E COMORBIDADES.

DOR LATERAL, COZEN +, MILLS +, SEM DÉFICITS NEUROVASCULARES E COM BOA PERFUSÃO PERIFÉRICA,
AUSÊNCIA DE EDEMA OU EQUIMOSE, COM ADM TOTAL E SEM SINAIS FLOGÍSTICOS.

CD: ORIENTAÇÕES GERAIS AO PACIENTE, ANALGESIA E SEGUIMENTO AMBULATORIAL.

${IM}`,
  },
  {
    id: "pront-punho-tendinite",
    group: "prontuario",
    title: "Punho — tendinite",
    cid: "M65",
    topic: "tenossinovite-de-de-quervain",
    text: `DOR EM PUNHO, SEM HISTÓRIA DE TRAUMA RECENTE.
NEGA ALERGIAS E COMORBIDADES.

DOR EM FACE DORSAL DE PUNHO, SEM DÉFICITS NEUROVASCULARES E COM BOA PERFUSÃO PERIFÉRICA.
AUSÊNCIA DE EDEMA OU EQUIMOSE, COM ADM TOTAL E SEM SINAIS FLOGÍSTICOS.

CD: ORIENTAÇÕES GERAIS AO PACIENTE, ANALGESIA E SEGUIMENTO AMBULATORIAL.

${IM}`,
  },
  {
    id: "pront-quadril",
    group: "prontuario",
    title: "Quadril — dor sem trauma",
    cid: "R52 / S76",
    topic: "sindrome-dolorosa-do-grande-trocanter",
    text: `DOR EM QUADRIL, SEM HISTÓRIA DE TRAUMA RECENTE.
PACIENTE DEAMBULANDO SEM DIFICULDADES.
NEGA ALERGIAS E COMORBIDADES.

SEM DÉFICITS NEUROVASCULARES E COM BOA PERFUSÃO PERIFÉRICA,
AUSÊNCIA DE EDEMA OU EQUIMOSE, COM ADM TOTAL E SEM SINAIS FLOGÍSTICOS.

CD: ORIENTAÇÕES, RECEITA, REPOUSO E RETORNO AO PS SE NECESSÁRIO.
ENCAMINHO PARA SEGUIMENTO AMBULATORIAL.

${IM}`,
  },
  {
    id: "pront-joelho",
    group: "prontuario",
    title: "Joelho — dor sem trauma",
    cid: "M23",
    topic: "dor-patelofemoral",
    text: `DOR EM JOELHOS DIREITO E ESQUERDO HÁ CERCA DE 1 MÊS. NEGA TRAUMAS.
NEGA ALERGIAS E COMORBIDADES.

EF: SEM EDEMAS, SEM DERRAME ARTICULAR, TESTES LIGAMENTARES E MENISCAIS NEGATIVOS. DOR À PREENSÃO PATELAR.
SEM DOR À PALPAÇÃO DE INTERLINHAS E PATA DE GANSO.

CD: AINES.
ORIENTAÇÕES GERAIS.
SEGUIMENTO AMBULATORIAL.

${IM}`,
  },
  {
    id: "pront-fascite",
    group: "prontuario",
    title: "Fascite plantar",
    cid: "M72.2",
    topic: "fascite-plantar",
    text: `DOR EM PÉ, SEM HISTÓRIA DE TRAUMA RECENTE.
DOR À PALPAÇÃO DE CALCÂNEO, PULSOS PALPÁVEIS E SIMÉTRICOS, SEM DÉFICITS NEUROVASCULARES
E COM BOA PERFUSÃO PERIFÉRICA. ADM TOTAL E SEM SINAIS FLOGÍSTICOS.

CD: ANALGESIA, ORIENTAÇÕES GERAIS DE USO DE CALÇADO ADEQUADO, CRIOTERAPIA E ALONGAMENTO. SEGUIMENTO AMBULATORIAL.

${IM}`,
  },
  {
    id: "pront-trauma-htx",
    group: "prontuario",
    title: "Trauma de hemitórax",
    cid: "S20",
    text: `DOR EM HEMITÓRAX, COM HISTÓRIA DE TRAUMA RECENTE, PCTE EUPNEICO, COM BOA PERFUSÃO PERIFÉRICA.
NEGA ALERGIAS E COMORBIDADES.

PULSOS PRESERVADOS E SEM DÉFICITS NEUROVASCULARES, BEG, HIDRATADO, CORADO E ACIANÓTICO,
SEM HISTÓRIA DE FEBRE OU TOSSE. NEGA CANSAÇO E OUTROS SINTOMAS. RX SEM EVIDÊNCIA DE FRATURAS.

CD: ORIENTO PCTE, RETORNO EM 48H SEM MELHORA; SE FEBRE, TOSSE OU DISPNEIA PROCURAR CM.
ORIENTAÇÕES, RECEITA E ANALGESIA.

${IM}`,
  },
  {
    id: "pront-perna",
    group: "prontuario",
    title: "Perna — dor sem trauma",
    cid: "M79.6",
    topic: "tendao-de-aquiles",
    text: `PACIENTE RELATA DOR EM PERNA, RECENTE, SEM HISTÓRIA DE TRAUMA.
SEM EDEMA OU SINAIS FLOGÍSTICOS, CACIFO -.
NEGA ALERGIAS E COMORBIDADES.

PULSOS OK E PANTURRILHAS LIVRES, THOMPSON -, E FUNÇÃO E ADM DE JOELHO E TNZ SEM ALTERAÇÕES,
SEM DÉFICITS NEUROVASCULARES E BOA PERFUSÃO PERIFÉRICA.

CD: ANALGESIA E ORIENTAÇÕES. RETORNO S/N — ENC. PARA AMBULATÓRIO.

${IM}`,
  },
  {
    id: "pront-reaval-rx",
    group: "prontuario",
    title: "Reavaliação após o raio-X (sem fratura)",
    text: `REAVALIAÇÃO:

RADIOGRAFIA SEM EVIDÊNCIA DE FRATURAS AGUDAS OU OUTRAS ALTERAÇÕES ÓSSEAS SIGNIFICATIVAS.

CONDUTA:
TRATAMENTO SINTOMÁTICO CONFORME NECESSIDADE.
ORIENTAÇÕES GERAIS QUANTO A REPOUSO RELATIVO E RETORNO EM CASO DE PERSISTÊNCIA OU PIORA DOS SINTOMAS.
ANALGESIA.
ACOMPANHAMENTO AMBULATORIAL.

${IM}`,
  },
  {
    id: "pront-retorno-fratura",
    group: "prontuario",
    title: "Consulta de retorno — fratura conservadora (30 dias)",
    text: `CONSULTA DE RETORNO PARA ACOMPANHAMENTO DE FRATURA ______, TRATADA DE FORMA CONSERVADORA, COM EVOLUÇÃO DE APROXIMADAMENTE 30 DIAS.

SOLICITO REALIZAÇÃO DE RADIOGRAFIA DE CONTROLE E POSTERIOR REAVALIAÇÃO CLÍNICA.

--- REAVALIAÇÃO

RADIOGRAFIA EVIDENCIANDO CONSOLIDAÇÃO DE FRATURA.

CONDUTA:
RETIRADA DA TALA.
ORIENTAÇÕES GERAIS QUANTO À MOBILIZAÇÃO PROGRESSIVA DO MEMBRO ACOMETIDO.
ENCAMINHO PARA FISIOTERAPIA.
MANUTENÇÃO DE ACOMPANHAMENTO AMBULATORIAL.`,
  },
  {
    id: "pront-carta-ubs",
    group: "prontuario",
    title: "Carta à UBS — acompanhamento após consolidação",
    text: `CARTA À UBS:

ENCAMINHO PACIENTE PARA ACOMPANHAMENTO AMBULATORIAL APÓS CONSOLIDAÇÃO DE FRATURA ______, TRATADA DE FORMA CONSERVADORA.

SOLICITO ENCAMINHAMENTO PARA FISIOTERAPIA, COM FOCO NA RECUPERAÇÃO DA AMPLITUDE DE MOVIMENTO, FORTALECIMENTO MUSCULAR E REABILITAÇÃO FUNCIONAL DO MEMBRO ACOMETIDO.

CID:

GRATA.`,
  },

  // ---------- receita para casa ----------
  {
    id: "rx-diclo-dipi-ciclo",
    group: "receita",
    title: "Diclofenaco + dipirona + ciclobenzaprina",
    hint: "o esquema padrão do PS; com a orientação do gelo",
    text: `PACIENTE REFERE ______
NEGA COMORBIDADE
NEGA ALERGIA

USO ORAL

1. DIPIRONA 500MG --------- 30 CPS
TOMAR 02 COMPRIMIDOS DE 6/6H SE DOR

2. DICLOFENACO 50MG -------- 15 CPS
TOMAR 1 COMPRIMIDO DE 8/8H POR 5 DIAS

3. CICLOBENZAPRINA 10MG ---------------------
TOMAR 01 CP VO À NOITE POR 5 NOITES

${GELO}`,
  },
  {
    id: "rx-diclo-12h",
    group: "receita",
    title: "Diclofenaco 12/12h + dipirona + ciclobenzaprina",
    text: `USO ORAL:

1. DICLOFENACO SÓDICO 50 MG ---------------
TOMAR 01 COMP DE 12/12 HORAS, POR 5 DIAS

2. DIPIRONA 500MG --------------------------------
TOMAR 02 CP DE 6/6H, SE DOR

3. CICLOBENZAPRINA 10MG ---------------------
TOMAR 01 CP VO À NOITE POR 5 NOITES`,
  },
  {
    id: "rx-ibu-dipi-ciclo",
    group: "receita",
    title: "Ibuprofeno + dipirona + ciclobenzaprina",
    text: `USO ORAL

1. IBUPROFENO 300MG --------------------------
TOMAR 01 CP DE 8/8H POR 5 DIAS

2. DIPIRONA 500MG --------------------------
TOMAR 02 CP DE 08/08H SE DOR

3. CICLOBENZAPRINA ------------------------
TOMAR 01 CP VO À NOITE POR 5 NOITES`,
  },
  {
    id: "rx-ceto-dipi-pred",
    group: "receita",
    title: "Cetoprofeno + dipirona + prednisolona",
    text: `USO ORAL:

1. CETOPROFENO 100MG ----------------------------------
TOMAR 1 CP VIA ORAL DE 12 EM 12 HS POR 5 DIAS

2. DIPIRONA 500 MG ----------------------------------------
TOMAR 02 CP DE 6/6H SE DOR

3. PREDNISOLONA 20MG --------------------------------------
TOMAR 1 CP 1X AO DIA PELA MANHÃ POR 5 DIAS`,
  },
  {
    id: "rx-flancox-dipi",
    group: "receita",
    title: "Flancox (etoricoxibe) + dipirona",
    text: `USO ORAL:

1. FLANCOX 600MG --------------
TOMAR 01 COMP DE 12/12 HORAS, POR 5 DIAS

2. DIPIRONA 500MG -----------
TOMAR 02 CP DE 6/6H, SE DOR`,
  },
  {
    id: "rx-flancox-dipi-miosan",
    group: "receita",
    title: "Flancox + dipirona + Miosan Caf",
    text: `USO ORAL:

1. FLANCOX 600MG --------------
TOMAR 01 COMP DE 12/12 HORAS, POR 5 DIAS

2. DIPIRONA 500MG -----------
TOMAR 02 CP DE 6/6H, SE DOR

3. MIOSAN CAF 5/30MG ----------
TOMAR 01 CP À NOITE POR 5 DIAS`,
  },
  {
    id: "rx-adorlan-miosan",
    group: "receita",
    title: "Adorlan (tramadol + diclofenaco) + Miosan Caf",
    hint: "dor moderada a intensa",
    text: `USO ORAL:

1. ADORLAN 25MG -------------
TOMAR 01 COMP DE 8/8H, POR 5 DIAS

2. MIOSAN CAF 5/30MG ----------- 01 CX
TOMAR 01 CP DE 12/12H, POR 5 DIAS`,
  },
  {
    id: "rx-tramadol",
    group: "receita",
    title: "Tramadol — dor intensa",
    text: `USO ORAL:

1. TRAMADOL 50MG ----------------
TOMAR 01 COMP DE 8/8H, SE DOR INTENSA`,
  },
  {
    id: "rx-toragesic",
    group: "receita",
    title: "Toragesic (cetorolaco) sublingual + dipirona",
    text: `USO ORAL:

1. TORAGESIC 10MG --------------
01 CP SUBLINGUAL DE 8/8H POR 5 DIAS

2. DIPIRONA 500MG -----------
TOMAR 02 CP VO DE 6/6H SE DOR`,
  },
  {
    id: "rx-tandrilax",
    group: "receita",
    title: "Tandrilax / Torsilax",
    hint: "paracetamol + cafeína + carisoprodol + diclofenaco",
    text: `USO ORAL:

1. PARACETAMOL 300 MG + CAFEÍNA 30 MG + CARISOPRODOL 125 MG + DICLOFENACO 50 MG ------------------
TOMAR 1 CP, VIA ORAL, DE 8/8 HORAS POR NO MÁXIMO 5 DIAS.

(TANDRILAX OU TORSILAX)`,
  },
  {
    id: "rx-antibiotico-ferimento",
    group: "receita",
    title: "Ferimento — antibiótico + pomada",
    topic: "ferimentos-da-mao-unha-e-ponta-do-dedo",
    text: `USO ORAL:

1. CEFALEXINA 500MG --------------------
TOMAR 1 CP VIA ORAL DE 6/6 H POR 7 DIAS.

2. IBUPROFENO 300MG --------------------------
TOMAR 01 CP DE 8/8H POR 5 DIAS

USO TÓPICO:

1. NEOMICINA + BACITRACINA POMADA ------------
APLICAR NAS LESÕES 3X AO DIA, APÓS HIGIENE LOCAL.

${GELO}`,
  },
  {
    id: "rx-pomada",
    group: "receita",
    title: "Pomada — neomicina + bacitracina, 10 dias",
    text: `USO TÓPICO:

1. SULFATO DE NEOMICINA + BACITRACINA ZÍNCICA POMADA ------------------------------------
APLICAR EM LESÃO 2X AO DIA POR 10 DIAS`,
  },
  {
    id: "rx-indicacoes",
    group: "receita",
    title: "Para que serve cada um — Adorlan, Hetori, Flancox",
    hint: "a linha de indicação que vai na receita",
    text: `1. ADORLAN 25 MG ---------------------------------------------------------------------- 1 CX
TOMAR 1 CP, VO DE 12/12H POR 7 DIAS.
PARA: É UM MEDICAMENTO QUE COMBINA TRAMADOL E DICLOFENACO, INDICADO PARA O ALÍVIO DE DORES INFLAMATÓRIAS AGUDAS DE INTENSIDADE MODERADA A GRAVE. ELE É UTILIZADO PARA DORES PÓS-OPERATÓRIAS, DORES MUSCULARES E ARTICULARES INTENSAS, ENTRE OUTRAS.

1. HETORI 90 MG ------------------------------------------------------------------------ 1 CX
TOMAR 1 CP, VO 1X AO DIA POR 7 DIAS.
PARA: TRATAMENTO DA OSTEOARTRITE; TRATAMENTO DA ARTRITE REUMATOIDE; TRATAMENTO DE ESPONDILITE ANQUILOSANTE (INFLAMAÇÃO DA COLUNA E DE GRANDES ARTICULAÇÕES); ALÍVIO DA DOR.

1. FLANCOX 600 MG ----------------------------------------------------------------------- 1 CX
TOMAR 1 CP, VO DE 12/12H, POR 7 DIAS.
PARA: ARTROSE E ARTRITE REUMATOIDE.`,
  },
  {
    id: "rx-pediatria",
    group: "receita",
    title: "Pediatria — dipirona e ibuprofeno em gotas",
    hint: "a dose em gotas é por peso: confira antes de copiar",
    topic: "fraturas-na-crianca-torus-galho-verde-e-fise",
    text: `USO ORAL

1. DIPIRONA 500MG/ML GOTAS -----------------------
TOMAR 20 GOTAS DE 6/6H SE DOR

2. IBUPROFENO 50 MG/ML GOTAS ------------
TOMAR 20 GOTAS DE 12/12H POR 3 DIAS`,
  },

  // ---------- medicação na unidade ----------
  {
    id: "im-padrao",
    group: "im",
    title: "IM de uso imediato — o trio do PS",
    text: IM,
  },
  {
    id: "im-outras",
    group: "im",
    title: "Outras IM e a EV",
    hint: "o que cada unidade tem muda: Coltrax não tem no PS Engenho, cetoprofeno não tem na UPA Jandira",
    text: `MEDICAÇÕES INTRAMUSCULARES

CITONEURIN ---------------------------- 03 AMP
APLICAR 01 AMP DE 2/2 DIAS POR 5 DIAS.
DEXAMETASONA 1 AMP IM
CETOPROFENO 1 AMP IM

USO IMEDIATO:
DIPIRONA 1 AMP IM
COLTRAX 1 AMP IM

CETOPROFENO ------------------ 01 AMPOLA IM

BETAMETASONA (DIPROSPAN) 1 AMP IM AGORA (MEDICAÇÃO DE DEPÓSITO)

MEDICAÇÃO EV:
TRAMADOL 100MG EV + SF 200 ML — CORRER LENTO`,
  },

  // ---------- notas de urgência ----------
  {
    id: "nota-luxacao-ombro",
    group: "notas",
    title: "Luxação de ombro — nota, sedação e receita",
    topic: "luxacao-e-instabilidade-do-ombro",
    text: `DOR INTENSA EM OMBRO APÓS TRAUMA (QUEDA / MOVIMENTO BRUSCO).
NEGA ALERGIAS E COMORBIDADES.

AO EXAME: IMPOTÊNCIA FUNCIONAL DO OMBRO, DOR INTENSA À MOBILIZAÇÃO.
DEFORMIDADE EM "SINAL DA DRAGONA", SUGESTIVO DE LUXAÇÃO GLENOUMERAL.
ADM MUITO LIMITADA POR DOR.

AVALIAÇÃO NEUROVASCULAR: PULSOS PRESENTES, BOA PERFUSÃO DISTAL.
SEM DÉFICIT NEUROLÓGICO APARENTE (NERVO AXILAR PRESERVADO).
SEM PARESTESIAS.

CD:
- RX DE OMBRO
- REDUÇÃO FECHADA SE NECESSÁRIO

ORIENTAÇÕES:
COLOCAÇÃO DE TIPOIA
GELO LOCAL 20MIN 3–4X/DIA
EVITAR MOVIMENTOS DO OMBRO
RETORNO IMEDIATO SE DOR INTENSA, FORMIGAMENTO OU FRIEZA EM MEMBRO

PRESCRIÇÃO: ANTES DA REDUÇÃO (ANALGESIA / SEDAÇÃO)
DIPIRONA 1G EV 6/6H SE DOR
TRAMADOL 50–100MG EV SE DOR INTENSA
ONDANSETRONA 4MG EV SE NÁUSEAS

SEDAÇÃO PARA REDUÇÃO (SE NECESSÁRIO):
MIDAZOLAM 2–5MG EV LENTO
FENTANIL 50–100MCG EV

PÓS-REDUÇÃO:
DIPIRONA 1G VO/EV 6/6H SE DOR
IBUPROFENO 400–600MG VO 8/8H SE DOR
CODEÍNA + PARACETAMOL (SE DOR MODERADA/INTENSA)`,
  },
  {
    id: "nota-sutura",
    group: "notas",
    title: "Sutura — ferimento corto-contuso",
    topic: "ferimentos-da-mao-unha-e-ponta-do-dedo",
    text: `PACIENTE COM FCC EM ______ DE APROXIMADAMENTE 3 CM HÁ MENOS DE 6 HORAS, SEM PREJUÍZO MOTOR, TENDÕES EXTENSORES SUPERFICIAL E PROFUNDO ÍNTEGROS, SEM DNV, SEM SANGRAMENTO ATIVO.
AO EXAME:
BEG, CHAAA, EUPNEICO. LOTE.
AR: MV+ SIMÉTRICO, SEM RA.
ACV: BCRNF, 2T, S/S.
ABD: FLÁCIDO, RHA+, SEM ORGANOMEGALIAS.
NEUR: ECG 15/15, FM E REFLEXOS PRESERVADOS.
EXT: SEM EDEMAS, PANTURRILHAS LIVRES.

CONDUTA:
REALIZADA ANTISSEPSIA, ANESTESIA LOCAL E SUTURA.
CURATIVO COMPRESSIVO.
PRESCREVO SINTOMÁTICOS + ATB PARA CASA.
ORIENTO TROCA DE CURATIVO E RETIRADA DE SUTURA EM UBS.
ORIENTO BUSCAR UBS E RETORNO SE SINAIS DE ALARME.`,
  },
  {
    id: "nota-trauma-samu",
    group: "notas",
    title: "Trauma trazido pelo SAMU — ABCDE",
    hint: "complete o acidente e o local do trauma",
    text: `PACIENTE TRAZIDO PELO SAMU EM MACA RÍGIDA, IMOBILIZADO COM COLAR CERVICAL, VÍTIMA DE ACIDENTE ______ COM TRAUMA DIRETO EM ______, SEM PRESENÇA DE SANGRAMENTO ATIVO, SEM FRATURA EXPOSTA, SEM DEFORMIDADE NO MEMBRO ACOMETIDO. TRAUMA DE MÉDIA ENERGIA.

NEGA TCE, N/V OU PERDA DE CONSCIÊNCIA. NEGA DOR CERVICAL OU EM REGIÃO ESPINAL. NEGA DOR TORÁCICA, DISPNEIA OU DOR ABDOMINAL, NEGA DOR EM DEMAIS MEMBROS. NEGA SANGRAMENTOS, SEM DEMAIS QUEIXAS.

ALERGIA: NEGA
MUC: NEGA
COMORBIDADES: NEGA
NEGA TABAGISMO, ETILISMO, DROGAS
ÚLTIMA REFEIÇÃO: ______

EXAME FÍSICO:
A: VA PÉRVIAS. COLUNA CERVICAL SEM DOR À PALPAÇÃO/MOBILIZAÇÃO; COLAR CERVICAL RETIRADO.
B: MV+ BILATERAL E SIMÉTRICO, SEM RA, EXPANSIBILIDADE PRESERVADA, SATO₂ 98% EM AA.
C: HEMODINAMICAMENTE ESTÁVEL (PA 125/80 MMHG, FC 76 BPM). AC: RCR 2T BNF S/S. EXTREMIDADES PERFUNDIDAS, PULSOS PERIFÉRICOS PRESENTES. SEM HEMORRAGIA ATIVA. ABDOME FLÁCIDO, INDOLOR, PELVE ESTÁVEL.
D: ECG 15 (O4V5M6), LOTE, PIFR. SEM DÉFICITS MOTORES OU SENSITIVOS. SEM SINAIS DE TCE. COLUNA SEM DOR À PALPAÇÃO.
E: AUSÊNCIA DE FRATURAS EXPOSTAS OU DEFORMIDADES. COLUNA TORÁCICA/LOMBOSSACRA SEM DOR. DEMAIS MEMBROS SEM DEFORMIDADES OU OUTRAS LESÕES APARENTES. EXAME NEUROVASCULAR DISTAL PRESERVADO.

CONDUTA:
PRESCREVO ANALGESIA + HIDRATAÇÃO.
RADIOGRAFIA E REAVALIAÇÃO.`,
  },
  {
    id: "nota-trauma-box",
    group: "notas",
    title: "Trauma no box — fratura de perna após acidente de carro",
    topic: "fraturas-diafisarias-femur-tibia-umero",
    text: `AVALIADO PACIENTE EM BOX DA EMERGÊNCIA, TRAZIDO PELOS BOMBEIROS CIVIS APÓS ACIDENTE AUTOMOBILÍSTICO.
QUEIXA-SE DE DOR EM MEMBRO INFERIOR ______.
AO EXAME:
LÚCIDO, ORIENTADO, SEM HISTÓRICO DE TCE.
EUPNEICO EM AA. SAT 96% EM AA. EXPANSIBILIDADE TORÁCICA BILATERAL. SEM ESTIGMAS DE TRAUMA TORÁCICO.
RCR, 2T, BNF, S/S. PA: 130 X 90 MMHG, FC 89 BPM. SEM SANGRAMENTOS EXTERNOS. ABDOME PLANO, FLÁCIDO, INDOLOR, SEM DB. PELVE ESTÁVEL.
LOTE, GLASGOW 15, PIFR. SEM ALTERAÇÃO AO EXAME FÍSICO DE COLUNA CERVICAL, TORÁCICA E LOMBOSSACRA.

DOR EM MI ______, EDEMA 2+/4+ NO PÉ.
FCC DE 2 CM EM FACE ANTEROLATERAL DE TERÇO MÉDIO DA PERNA.

RADIOGRAFIA EVIDENCIA FRATURA TRANSVERSA DE OSSOS DA PERNA.
RADIOGRAFIA DE PÉ: SEM ALTERAÇÃO AGUDA.
CLASSIFICAÇÃO: ______
ENCAMINHO PACIENTE PARA SEGUIMENTO NO AMBULATÓRIO DE FRATURAS.`,
  },
  {
    id: "nota-fratura-exposta",
    group: "notas",
    title: "Fratura exposta — nota, antibiótico e tétano",
    topic: "fratura-exposta",
    text: `PACIENTE VÍTIMA DE TRAUMA, COM LESÃO EM MEMBRO ______ ASSOCIADA A FERIMENTO ABERTO.
REFERE DOR INTENSA, SANGRAMENTO E IMPOTÊNCIA FUNCIONAL.
AO EXAME, OBSERVA-SE FERIMENTO EM REGIÃO DE (DESCREVER), COM EXPOSIÇÃO ÓSSEA / SUSPEITA DE FRATURA EXPOSTA, ASSOCIADO A EDEMA E SANGRAMENTO.
AVALIADA PRESENÇA DE CONTAMINAÇÃO (TERRA, DETRITOS, CORPO ESTRANHO).

EF: AVALIADA PERFUSÃO DISTAL (PREENCHIMENTO CAPILAR < 2 SEG), SENSIBILIDADE E MOBILIDADE, SEM/COM DÉFICIT NEUROVASCULAR.
CLASSIFICAÇÃO DE GUSTILO (SE POSSÍVEL): TIPO I / II / III.

CONDUTA IMEDIATA (PS):
REALIZADA ANALGESIA.
REALIZADA IRRIGAÇÃO ABUNDANTE COM SF 0,9% E COBERTURA COM CURATIVO ESTÉRIL (SEM FECHAMENTO PRIMÁRIO).
IMOBILIZAÇÃO DO MEMBRO COM TALA ADEQUADA.
REALIZADO ACESSO VENOSO.
INICIADA ANTIBIOTICOTERAPIA PRECOCE.
VERIFICADO/ATUALIZADO ESTADO VACINAL PARA TÉTANO.
ENCAMINHO PARA O SERVIÇO DE ORTOPEDIA CIRÚRGICA.

ANTIBIÓTICOS (COLINHA PRÁTICA)
GUSTILO I (LEVE CONTAMINAÇÃO E LESÃO DE PARTES MOLES, < 1 CM) E II (MODERADA CONTAMINAÇÃO E LESÃO DE PARTES MOLES, > 1 CM):
CEFAZOLINA 1G EV 8/8H

GUSTILO III (ALTA CONTAMINAÇÃO E LESÃO DE PARTES MOLES, > 10 CM):
CEFAZOLINA 1G EV 8/8H
GENTAMICINA 5 MG/KG EV 1X/DIA

CONTAMINAÇÃO COM TERRA / RISCO ANAERÓBIO: METRONIDAZOL 500 MG EV 8/8H

TÉTANO
VACINA DESATUALIZADA OU DESCONHECIDA: → VACINA + IMUNOGLOBULINA ANTITETÂNICA
VACINA ATUALIZADA: → NÃO NECESSITA IG, AVALIAR REFORÇO`,
  },
  {
    id: "nota-radio-distal",
    group: "notas",
    title: "Fratura de rádio distal sem desvio",
    topic: "fratura-do-radio-distal",
    text: `PACIENTE COM HISTÓRIA DE TRAUMA EM MEMBRO SUPERIOR (QUEDA SOBRE MÃO ESTENDIDA / TRAUMA DIRETO).
REFERE DOR EM REGIÃO DE PUNHO, ASSOCIADA A EDEMA LOCAL E LIMITAÇÃO DE MOVIMENTOS.
AO EXAME, APRESENTA DOR À PALPAÇÃO EM REGIÃO DE RÁDIO DISTAL, COM EDEMA LOCAL, SEM DEFORMIDADE EVIDENTE. SEM FERIMENTOS ASSOCIADOS.
EF: MOBILIDADE DO PUNHO LIMITADA POR DOR. AVALIADA PERFUSÃO DISTAL (PREENCHIMENTO CAPILAR < 2 SEG), SENSIBILIDADE PRESERVADA E MOVIMENTAÇÃO DOS DEDOS PRESENTE, SEM DÉFICIT NEUROVASCULAR.
RX DE PUNHO: EVIDENCIA FRATURA DE RÁDIO DISTAL, SEM DESVIO.

CONDUTA:
REALIZADA IMOBILIZAÇÃO COM TALA GESSADA TIPO ANTEBRAQUIOPALMAR, MANTENDO PUNHO EM POSIÇÃO FUNCIONAL.
ORIENTADO ELEVAÇÃO DO MEMBRO E APLICAÇÃO DE GELO LOCAL (20 MIN, 3-4X/DIA) NAS PRIMEIRAS 48H.
PRESCRITA ANALGESIA CONFORME NECESSIDADE.
MANTER IMOBILIZAÇÃO, EVITAR APOIO DO MEMBRO ACOMETIDO.
ORIENTADO OBSERVAR SINAIS DE ALERTA: AUMENTO IMPORTANTE DA DOR, PARESTESIAS, PALIDEZ OU FRIEZA DISTAL, EDEMA PROGRESSIVO (→ SUSPEITA DE SÍNDROME COMPARTIMENTAL OU COMPROMETIMENTO VASCULAR).
ENCAMINHADO PARA AVALIAÇÃO ORTOPÉDICA / RETORNO AMBULATORIAL EM 7 DIAS PARA REAVALIAÇÃO E NOVO RX.`,
  },
  {
    id: "nota-colles",
    group: "notas",
    title: "Fratura de Colles (rádio distal com desvio dorsal)",
    topic: "fratura-do-radio-distal",
    text: `PACIENTE COM HISTÓRIA DE QUEDA SOBRE MÃO ESTENDIDA.
REFERE DOR INTENSA EM PUNHO, EDEMA E DEFORMIDADE LOCAL.
AO EXAME, OBSERVA-SE DEFORMIDADE TÍPICA EM "DORSO DE GARFO", EDEMA E DOR À PALPAÇÃO.
EF: AVALIADA PERFUSÃO DISTAL, SENSIBILIDADE E MOBILIDADE DOS DEDOS, SEM/COM ALTERAÇÃO NEUROVASCULAR.
RX: FRATURA DE RÁDIO DISTAL COM DESVIO DORSAL.

CONDUTA:
REALIZADA ANALGESIA.
REALIZADA REDUÇÃO FECHADA (SE INDICADO).
IMOBILIZAÇÃO COM TALA GESSADA ANTEBRAQUIOPALMAR.
ENCAMINHADO PARA ORTOPEDIA.
ORIENTAÇÕES DE ALERTA (NEUROVASCULAR + COMPARTIMENTAL).`,
  },
  {
    id: "nota-entorse-sem-fratura",
    group: "notas",
    title: "Entorse de tornozelo sem fratura",
    topic: "entorse-de-tornozelo",
    text: `PACIENTE COM ENTORSE DE TORNOZELO (INVERSÃO/EVERSÃO).
REFERE DOR, EDEMA E DIFICULDADE PARA DEAMBULAR.
AO EXAME, EDEMA EM REGIÃO MALEOLAR, DOR À PALPAÇÃO LIGAMENTAR, SEM DEFORMIDADE.
EF: APOIO POSSÍVEL/IMPOSSÍVEL. SEM DÉFICIT NEUROVASCULAR.
RX: SEM FRATURA.

CONDUTA:
RICE (REPOUSO, GELO, COMPRESSÃO, ELEVAÇÃO).
IMOBILIZAÇÃO COM TORNOZELEIRA OU TALA.
ANALGESIA.
ORIENTAR EVITAR CARGA SE DOR INTENSA.
REAVALIAÇÃO SE PIORA.`,
  },
  {
    id: "nota-fratura-tornozelo",
    group: "notas",
    title: "Fratura de tornozelo (maleolar)",
    topic: "fraturas-do-tornozelo",
    text: `PACIENTE COM TRAUMA EM TORNOZELO, COM DOR INTENSA E INCAPACIDADE DE APOIO.
AO EXAME, EDEMA IMPORTANTE, DOR À PALPAÇÃO MALEOLAR, +/- DEFORMIDADE.
EF: CHECAR PERFUSÃO, SENSIBILIDADE E MOBILIDADE DISTAL.
RX: FRATURA MALEOLAR.

CONDUTA:
IMOBILIZAÇÃO COM TALA SUROPODÁLICA.
NÃO APOIAR MEMBRO.
ANALGESIA.
ENCAMINHAMENTO ORTOPEDIA (URGENTE SE DESVIO).`,
  },
  {
    id: "nota-boxer",
    group: "notas",
    title: "Fratura de metacarpo (boxer — 5º metacarpo)",
    topic: "fraturas-de-metacarpo-e-falanges",
    text: `PACIENTE COM TRAUMA EM MÃO (SOCO/IMPACTO).
REFERE DOR E EDEMA EM REGIÃO DE MÃO.
AO EXAME, DOR À PALPAÇÃO EM 5º METACARPO, EDEMA, +/- DESVIO.
EF: AVALIAR ALINHAMENTO DOS DEDOS (ROTAÇÃO!), PERFUSÃO E SENSIBILIDADE.
RX: FRATURA DE METACARPO.

CONDUTA:
IMOBILIZAÇÃO COM TALA ULNAR (TIPO "LUVA").
ANALGESIA.
ENCAMINHAR ORTOPEDIA.`,
  },
  {
    id: "nota-falange",
    group: "notas",
    title: "Fratura de falange",
    topic: "fraturas-de-metacarpo-e-falanges",
    text: `PACIENTE COM TRAUMA EM DEDO, COM DOR, EDEMA E LIMITAÇÃO DE MOVIMENTO.
AO EXAME, EDEMA LOCAL, DOR À PALPAÇÃO, SEM/COM DEFORMIDADE.
EF: MOBILIDADE, SENSIBILIDADE E PERFUSÃO PRESERVADAS.
RX: FRATURA DE FALANGE.

CONDUTA:
IMOBILIZAÇÃO (SINDACTILIA OU TALA).
ANALGESIA.
ORIENTAÇÃO FUNCIONAL.`,
  },
  {
    id: "nota-clavicula",
    group: "notas",
    title: "Fratura de clavícula",
    topic: "fratura-de-clavicula",
    text: `PACIENTE COM QUEDA SOBRE OMBRO.
REFERE DOR EM REGIÃO CLAVICULAR.
AO EXAME, DOR LOCAL, CREPITAÇÃO, POSSÍVEL DEFORMIDADE.
EF: AVALIAR PLEXO BRAQUIAL E PERFUSÃO.
RX: FRATURA DE CLAVÍCULA.

CONDUTA:
IMOBILIZAÇÃO COM TIPOIA.
ANALGESIA.
ORIENTAR EVITAR ELEVAÇÃO DO MEMBRO.
SE DESVIO IMPORTANTE → ORTOPEDIA.`,
  },
  {
    id: "nota-umero-proximal",
    group: "notas",
    title: "Fratura de úmero proximal",
    topic: "fratura-do-umero-proximal",
    text: `PACIENTE COM QUEDA, DOR EM OMBRO E LIMITAÇÃO IMPORTANTE.
AO EXAME, DOR À PALPAÇÃO E IMPOTÊNCIA FUNCIONAL.
EF: AVALIAR NERVO AXILAR (SENSIBILIDADE DO DELTOIDE!).
RX: FRATURA DE ÚMERO PROXIMAL.

CONDUTA:
TIPOIA.
ANALGESIA.
ENCAMINHAMENTO ORTOPEDIA.`,
  },

  // ---------- incidências do raio-X ----------
  {
    id: "rx-incidencias",
    group: "raio-x",
    title: "Incidências por região",
    topic: "como-pedir-o-raio-x",
    text: `PÉ: AP + OBLÍQUO + PERFIL
TORNOZELO: AP + PERFIL + MORTISE
PERNA: AP + PERFIL
JOELHO: AP + PERFIL
PATELA: AP + PERFIL + AXIAL
COXA: AP + PERFIL
QUADRIL: AP + PERFIL
BACIA: AP
COLUNA (LOMBAR, TORÁCICA, CERVICAL): AP + PERFIL
MÃO: AP + OBLÍQUO + PERFIL
PUNHO: AP + PERFIL
ANTEBRAÇO: AP + PERFIL
COTOVELO: AP + PERFIL
BRAÇO: AP + PERFIL
OMBRO: AP VERDADEIRO + PERFIL ESCAPULAR + AXILAR
CLAVÍCULA: AP + ZANCA (BICOMIAL OU BILATERAL)`,
  },
];

/** As colas de um tópico do guia. */
export function colaForTopic(slug: string): ColaEntry[] {
  return COLA.filter((c) => c.topic === slug);
}

export function colaByGroup(group: ColaGroup): ColaEntry[] {
  return COLA.filter((c) => c.group === group);
}
