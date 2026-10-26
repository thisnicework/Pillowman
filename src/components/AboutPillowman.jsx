import React, { useState } from 'react';
import OrnamentDivider from './OrnamentDivider';

export default function AboutPillowman() {
  const [directorPage, setDirectorPage] = useState(1);
  return (
    <section className="section section-darker" id="about">
      <div className="container">
        
        {/* ==========================================================================
            1. ABOUT THE SHOW (작품 소개)
            ========================================================================== */}
        <div className="theatre-card-woodcut" style={{ marginBottom: '60px' }}>
          <OrnamentDivider />
          <h2 className="section-title-warhaven">ABOUT PILLOWMAN</h2>
          <OrnamentDivider />

          <div style={{ margin: '36px auto 20px', maxWidth: '620px', textAlign: 'center', lineHeight: '2.1' }}>
            <p style={{ fontSize: '1.15rem', color: 'var(--title-color)', fontWeight: 700, marginBottom: '16px' }}>
              세계를 사로잡은 마틴 맥도너의 대표작, 새로운 뮤지컬의 등장
            </p>
            <p style={{ marginBottom: '16px' }}>
              올리비에상 수상, 토니상 후보<br />
              동시대 최고의 이야기꾼 마틴 맥도너<br />
              〈쓰리 빌보드〉, 〈이니셰린의 밴시〉로 무대와 스크린을 넘나들며 사랑받아온 그가 가장 아끼는 작품으로 꼽은 〈필로우맨〉<br />
              2003년 런던 초연 이후<br />
              잔혹한 웃음과 서늘한 질문으로 세계를 흔든 이야기가<br />
              <strong style={{ color: 'var(--accent-red)' }}>이제, 노래가 된다.</strong>
            </p>

            <div style={{ margin: '24px 0', borderTop: '1px solid var(--border-vintage)', borderBottom: '1px solid var(--border-vintage)', padding: '20px 0' }}>
              <p style={{ fontSize: '1.1rem', color: 'var(--title-color)', fontWeight: 700, marginBottom: '8px' }}>
                이야기가 현실이 된 순간, 작가는 용의자가 되었다
              </p>
              <p>
                동화처럼 시작된 이야기가<br />
                어느 순간 현실의 사건으로 이어지고<br />
                이야기 속 장면과 닮아가는 현실<br />
                그 중심에 선 한 명의 작가이자 용의자.<br />
                이야기와 현실의 경계가 무너지는 순간,<br />
                이 모든 것은 우연일까,<br />
                아니면 처음부터 쓰여질 이야기였을까.
              </p>
            </div>

            <p style={{ fontSize: '1.1rem', color: 'var(--title-color)', fontWeight: 700, marginBottom: '8px' }}>
              무대 밖으로 확장된 카투리안의 세계
            </p>
            <p>
              뮤지컬 〈필로우맨〉은 작품 속 세계와 이야기를 하나의 세계관으로 구축하고<br />
              이를 전시로 확장해 무대 밖에서도 펼쳐낸다.<br />
              사과로 만든 작은 인형,<br />
              피리 부는 사나이를 따라간 아이,<br />
              슬픈 아이들을 찾아온다는 ‘필로우맨’<br />
              그리고 목소리로 전해지는 수많은 이야기들<br /><br />
              <strong style={{ color: 'var(--title-color)' }}>이야기는 끝나지 않는다,<br />형태를 바꾸며 다음 이야기로 건너간다</strong>
            </p>
          </div>
        </div>

        {/* ==========================================================================
            2. SYNOPSIS (시놉시스 - Exact Match to User Reference Image 3)
            ========================================================================== */}
        <div className="synopsis-theatre-card">
          <OrnamentDivider />
          <h2 className="section-title-warhaven">SYNOPSIS</h2>
          <OrnamentDivider />

          <div className="synopsis-text-centered">
            <p>
              어느 전체주의 국가의 취조실. 잔혹한 아동 연쇄 살인 사건이 발생하고, 아동을 소재로 한 잔혹 동화를 쓰는 무명 작가 카투리안과 그의 형 마이클이 유력한 용의자로 체포된다. 수사관 투폴스키와 형사 아리엘은 카투리안의 동화 내용과 실제 살인 사건 방식이 정교하게 일치한다는 점을 들어 그들을 거칠게 압박한다.
            </p>
            <p>
              카투리안은 자신의 동화 대부분이 출판된 적도 없는 순수한 창작물일 뿐이라며 억울함을 호소하지만, 옆방에 갇힌 형 마이클마저 심혹한 조사를 받게 되자 불안감은 극에 달한다. 취조가 진행될수록 부모의 비극적인 학대 속에서 서로만을 의지하며 살아온 형제의 잔혹한 과거사가 드러나고, 동화와 현실 사이의 미스터리한 간극은 두 형제를 벼랑 끝으로 몰아넣는다.
            </p>
            <p>
              벗어날 수 없는 혐의와 위기 속에서, 카투리안은 형을 지키기 위해 잔혹한 결단을 내린다. 그리고 평생을 바쳐 쓴 자신의 동화 원고들을 보존하기 위한 마지막 거래를 제안하는데…
            </p>
          </div>
        </div>

        {/* ==========================================================================
            3. DIRECTOR'S NOTE (연출의 말 - 3-Card Complete Sequence)
            ========================================================================== */}
        <div className="director-section-wrapper" id="directors-note">
          <div className="section-header-wrap" style={{ textAlign: 'center', marginBottom: '24px' }}>
            <OrnamentDivider />
            <h2 className="section-title-warhaven" style={{ margin: '14px 0 10px' }}>
              DIRECTOR'S NOTE
            </h2>
            <OrnamentDivider />
          </div>

          {/* Director's Note Page Navigator */}
          <div className="director-page-nav" role="tablist" aria-label="연출의 말 페이지 선택">
            <button 
              type="button" 
              className={`page-pill ${directorPage === 1 ? 'active' : ''}`}
              onClick={() => setDirectorPage(1)}
              role="tab"
              aria-selected={directorPage === 1}
            >
              PAGE 01
            </button>
            <button 
              type="button" 
              className={`page-pill ${directorPage === 2 ? 'active' : ''}`}
              onClick={() => setDirectorPage(2)}
              role="tab"
              aria-selected={directorPage === 2}
            >
              PAGE 02
            </button>
            <button 
              type="button" 
              className={`page-pill ${directorPage === 3 ? 'active' : ''}`}
              onClick={() => setDirectorPage(3)}
              role="tab"
              aria-selected={directorPage === 3}
            >
              PAGE 03
            </button>
            <button 
              type="button" 
              className={`page-pill ${directorPage === 'all' ? 'active' : ''}`}
              onClick={() => setDirectorPage('all')}
              role="tab"
              aria-selected={directorPage === 'all'}
            >
              전체 보기
            </button>
          </div>

          {/* =================== CARD 01 =================== */}
          {(directorPage === 1 || directorPage === 'all') && (
            <div className="director-theatre-card" key="card-1">
              <div className="card-page-indicator">01 / 03</div>
              <OrnamentDivider />
              <h3 className="card-inner-subtitle">DIRECTOR'S NOTE</h3>
              <OrnamentDivider />

              <div className="director-text-centered">
                <p>
                  <span className="highlight-red-bold">이야기는 살아남는다.</span><br /><br />
                  결국, 이야기는 살아남는다.
                </p>

                <p>
                  그것을 쓴 사람이 사라진 뒤에도, 누군가의 기억 속에서, 누군가의 선택 속에서,<br />
                  때로는 그것을 만든 사람조차 예상하지 못한 모습으로.
                </p>

                <p>
                  그리고 이야기는 사람을 통과하며 다른 얼굴을 얻는다.<br />
                  한 사람에게는 살아갈 이유가 되고, 다른 사람에게는 폭력을 정당화하는 이유가 된다.
                </p>

                <p>
                  카투리안에게 이야기는 자신과 형을 세상에 남기는 마지막 방법이고,<br />
                  마이클에게는 현실과 상상의 경계가 사라진 세계였으며,<br />
                  아리엘에게는 가장 어두웠던 순간 자신을 살아가게 했던 작은 희망이었다.
                </p>

                <p>
                  그러나 그 이야기는 어느 순간 살인의 증거가 되고,<br />
                  심문의 대상이자, 사라져야 할 위험한 기록이 된다.<br />
                  한때 아리엘을 살게 했던 이야기가<br />
                  훗날 그가 믿어 온 정의를 흔드는 순간으로 돌아온다는 사실은<br />
                  이 작품이 가진 가장 잔인한 역설이기도 하다.
                </p>
              </div>

              <OrnamentDivider />

              {directorPage !== 'all' && (
                <div className="card-pagination-footer">
                  <span className="page-ghost"></span>
                  <button 
                    type="button" 
                    className="btn-card-next" 
                    onClick={() => setDirectorPage(2)}
                  >
                    다음 페이지 (02) ➔
                  </button>
                </div>
              )}
            </div>
          )}

          {/* =================== CARD 02 =================== */}
          {(directorPage === 2 || directorPage === 'all') && (
            <div className="director-theatre-card" key="card-2">
              <div className="card-page-indicator">02 / 03</div>
              <OrnamentDivider />

              <div className="director-text-centered">
                <p style={{ marginTop: '16px' }}>
                  그렇기에, 이 작품을 새롭게 재창작하면서 설정했던 가장 우선적인 방향성은<br />
                  <span className="highlight-red-bold">‘이야기가 무엇을 말하는가’보다 ‘이야기가 무엇을 남기는가’였다.</span>
                </p>

                <p>
                  뮤지컬이라는 형식은 그 질문을 더욱 집요하게 반복한다.<br />
                  처음에는 아름답고 순수했던 선율이 다른 인물의 입에서 폭력이 되고,<br />
                  위로였던 노래는 의심이 되며, 한때의 희망은 전혀 다른 의미의 기억으로 돌아온다.<br />
                  그렇게 같은 음악이 반복될수록, 우리는 같은 이야기를 듣고 있으면서도<br />
                  더 이상 같은 이야기를 듣고 있지 않게 된다.
                </p>

                <p>
                  또한 무대 위의 ‘이야기들’ 역시 동화 속에 머물지 않는다.<br />
                  그들은 현실과 환상, 과거와 현재, 인물과 관객의 경계를 넘나들며<br />
                  우리가 안전하다고 믿었던 이야기와 현실 사이의 선을 조금씩 지워간다.
                </p>

                <p>
                  그 선이 사라지는 순간, 관객 역시 더 이상 이야기의 바깥에 서 있을 수 없다.<br />
                  그렇게 우리는 잔혹한 이야기를 비난하면서도 그 다음을 궁금해한다.<br />
                  폭력을 불편해 하면서도 아름다운 음악을 따라가고,<br />
                  누가 옳은 지 판단하고 싶어 하면서도 진실에 닿기 전에 이미 누군가를 믿고 누군가를 의심한다.
                </p>

                <p>
                  그리고 그 순간 관객은 더 이상 사건을 바라보는 구경꾼이 아닌,<br />
                  이야기에 매혹되고, 그것을 소비하고, 판단하고, 기억하는 또 한 명의 목격자가 된다.
                </p>
              </div>

              <OrnamentDivider />

              {directorPage !== 'all' && (
                <div className="card-pagination-footer">
                  <button 
                    type="button" 
                    className="btn-card-prev" 
                    onClick={() => setDirectorPage(1)}
                  >
                    ⬅ 이전 페이지 (01)
                  </button>
                  <button 
                    type="button" 
                    className="btn-card-next" 
                    onClick={() => setDirectorPage(3)}
                  >
                    다음 페이지 (03) ➔
                  </button>
                </div>
              )}
            </div>
          )}

          {/* =================== CARD 03 (New Uploaded Reference) =================== */}
          {(directorPage === 3 || directorPage === 'all') && (
            <div className="director-theatre-card" key="card-3">
              <div className="card-page-indicator">03 / 03</div>
              <OrnamentDivider />

              <div className="director-text-centered">
                <p style={{ marginTop: '16px' }}>
                  연출로서, 또 작가로서, 이 작품을 통해 하나의 정답을 말하고 싶지는 않았다.<br />
                  오히려 우리가 너무 쉽게 내려왔던 판단 앞에서, 망설임을 가지고 아주 잠시 멈춰 서고 싶었다.
                </p>

                <div className="highlight-red-box">
                  <p className="highlight-red-bold" style={{ lineHeight: '2.1', margin: 0 }}>
                    이야기는 그저 이야기일까.<br />
                    현실을 비추는 거울일까.<br />
                    아니면 우리가 그것을 믿는 순간,<br />
                    비로소 현실이 되는 것일까.
                  </p>
                </div>

                <p>
                  막이 내리면 카투리안은 사라지지만, 그의 이야기는 사라지지 않는다.<br />
                  불태워질 운명이었던 이야기들은 누군가의 선택으로 살아남고,<br />
                  봉인된 채 언젠가 다시 읽힐 순간을 기다린다.<br />
                  이 공연 역시 그랬으면 한다.
                </p>

                <p>
                  무대의 마지막 불빛이 꺼진 뒤에도,<br />
                  하나의 질문이 관객의 마음 어딘가에 남아 계속해서 다음 이야기를 만들어내기를.<br />
                  그렇게 어쩌면, 〈필로우맨〉의 마지막 이야기는 무대 위가 아니라, 당신 안에서 시작될 것이다.
                </p>

                <p style={{ marginTop: '32px', marginBottom: '8px', fontSize: '1.08rem', color: 'var(--title-color)', fontWeight: 600 }}>
                  그렇게 결국, 이야기는 살아남는다.
                </p>
              </div>

              <OrnamentDivider />

              {/* Card 3 Official Logo from user's design */}
              <div className="director-card-logo-wrap">
                <img 
                  src="/assets/logo-white.png" 
                  alt="뮤지컬 필로우맨" 
                  className="director-card-logo"
                />
              </div>

              {directorPage !== 'all' && (
                <div className="card-pagination-footer" style={{ marginTop: '24px' }}>
                  <button 
                    type="button" 
                    className="btn-card-prev" 
                    onClick={() => setDirectorPage(2)}
                  >
                    ⬅ 이전 페이지 (02)
                  </button>
                  <button 
                    type="button" 
                    className="btn-card-next" 
                    onClick={() => setDirectorPage('all')}
                  >
                    전체 보기 ➔
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ==========================================================================
            4. EXHIBITION (전시 소개)
            ========================================================================== */}
        <div className="exhibition-theatre-card">
          <OrnamentDivider />
          <h2 className="section-title-warhaven">EXHIBITION</h2>
          <OrnamentDivider />

          <div className="exhibition-text-centered">
            <h3 style={{ fontFamily: 'var(--font-title)', letterSpacing: '-0.04em', fontSize: '1.35rem', color: 'var(--title-color)', marginBottom: '6px' }}>
              《The Pillowman: I’m Here, Somewhere in Your Story》
            </h3>
            <p style={{ color: 'var(--accent-red)', fontWeight: 700, marginBottom: '18px' }}>
              Prologue: 카투리안의 방
            </p>
            <p style={{ maxWidth: '620px', margin: '0 auto 16px', lineHeight: '1.9' }}>
              〈필로우맨〉 속 카투리안의 머릿속에서 시작된 이야기는 현실이 되고, 현실이 된 이야기는 증거로 남는다. 이 전시는 카투리안의 방에서 시작된 이야기가 현실과 증거를 거쳐 다시 상상과 작품으로 이어지는 과정을 따라간다.<br /><br />
              <strong>이야기는 왜 증거물이 되었는가.</strong><br />
              이야기는 증거물의 모습으로 지금 여기에 있다. 그러나 증거는 이야기를 끝내는 것이 아니라 아직 드러나지 않은 곳을 가리킨다. 남겨진 증거를 따라가면 우리는 이야기가 처음 시작된 곳, 카투리안의 방에 도착한다. 아직 현실이 되기 전, 그의 머릿속에 머물러 있던 이야기로.<br /><br />
              그곳에서 증거로 남겨졌던 이야기들은 다시 상상되고 해석되며 하나의 작품이 된다. 그리고 작품이 된 이야기는 다시 관객에게 건너가 각자의 기억과 상상 속에서 또 다른 의미를 얻는다.<br /><br />
              <strong style={{ color: 'var(--title-color)' }}>이야기는 끝나지 않는다. 형태를 바꾸며 다음 이야기로 건너간다.</strong>
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
