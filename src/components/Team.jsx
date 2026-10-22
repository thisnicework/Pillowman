import React, { useState } from 'react';
import OrnamentDivider from './OrnamentDivider';

export default function Team() {
  const [activeTab, setActiveTab] = useState('production');

  const mainCast = [
    { id: 'katurian', role: '카투리안', name: '박정윤', photo: '/assets/actor-katurian.png' },
    { id: 'ariel', role: '아리엘', name: '김예린', photo: '/assets/actor-ariel.png' },
    { id: 'tupolski', role: '투폴스키', name: '이세중', photo: '/assets/actor-tupolski.png' },
    { id: 'michal', role: '마이클', name: '손승우', photo: '/assets/actor-michael.png' },
  ];

  const storyCast = [
    { id: 'story1', role: '이야기 1', name: '최하영', photo: '/assets/actor-story1.png' },
    { id: 'story2', role: '이야기 2', name: '남다현', photo: '/assets/actor-story2.png' },
    { id: 'story3', role: '이야기 3', name: '신현우', photo: '/assets/actor-story3.png' },
  ];

  const renderPhotoSlot = (member) => (
    <div className={`cast-photo-slot ${member.photo ? 'has-photo' : ''}`}>
      {member.photo ? (
        <img src={member.photo} alt={`${member.role}역 ${member.name}`} />
      ) : (
        <>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.28, marginBottom: '8px' }}>
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
          <span>[프로필 사진 전달 대기]</span>
        </>
      )}
    </div>
  );

  return (
    <section className="section" id="team">
      <div className="container">
        <div className="section-header-box">
          <OrnamentDivider />
          <h2 className="section-title-warhaven">TEAM</h2>
          <OrnamentDivider />
        </div>

        {/* Team Tab Navigation */}
        <div className="team-tab-nav">
          <button
            type="button"
            className={`team-nav-btn ${activeTab === 'production' ? 'active' : ''}`}
            onClick={() => setActiveTab('production')}
          >
            Production
          </button>
          <button
            type="button"
            className={`team-nav-btn ${activeTab === 'performance' ? 'active' : ''}`}
            onClick={() => setActiveTab('performance')}
          >
            Performance
          </button>
          <button
            type="button"
            className={`team-nav-btn ${activeTab === 'cast' ? 'active' : ''}`}
            onClick={() => setActiveTab('cast')}
          >
            Cast
          </button>
          <button
            type="button"
            className={`team-nav-btn ${activeTab === 'exhibition' ? 'active' : ''}`}
            onClick={() => setActiveTab('exhibition')}
          >
            Exhibition
          </button>
          <button
            type="button"
            className={`team-nav-btn ${activeTab === 'special-thanks' ? 'active' : ''}`}
            onClick={() => setActiveTab('special-thanks')}
          >
            Special Thanks to
          </button>
          <button
            type="button"
            className={`team-nav-btn ${activeTab === 'thanks' ? 'active' : ''}`}
            onClick={() => setActiveTab('thanks')}
          >
            Thanks to
          </button>
        </div>

        {/* 1. Production Tab */}
        {activeTab === 'production' && (
          <div>
            <div className="credit-deck">
              <div className="credit-box">
                <div className="credit-box-title">ORIGINAL WORK</div>
                <div className="credit-box-content">
                  원작 : The Pillowman by Martin McDonagh
                </div>
              </div>

              <div className="credit-box">
                <div className="credit-box-title">ADVISORS</div>
                <div className="credit-box-content">
                  지도교수 : 정승호 김명진 홍우영 김치영
                </div>
              </div>

              <div className="credit-box">
                <div className="credit-box-title">PLANNING</div>
                <div className="credit-box-content">
                  기획 : 이유진 엄대한 남선우 김대찬
                </div>
              </div>

              <div className="credit-box">
                <div className="credit-box-title">MEDIA & PROMOTION</div>
                <div className="credit-box-content">
                  사진 : 남선우<br />
                  홍보영상 : 류다현 목지혜 김익수 이상욱 조유정<br />
                  홍보디자인 : 우태은<br />
                  웹사이트 : 안현준
                </div>
              </div>
            </div>

            <div className="support-banner-clean">
              <div style={{ fontFamily: 'var(--font-title)', letterSpacing: '-0.04em', fontSize: '0.9rem', color: 'var(--accent-red)', marginBottom: '6px' }}>
                제작지원
              </div>
              <div style={{ fontFamily: 'var(--font-title)', letterSpacing: '-0.03em', fontSize: '1.2rem', color: 'var(--title-color)', fontWeight: 700 }}>
                서울예술대학교 앵커사업단 &nbsp;×&nbsp; EMK뮤지컬컴퍼니
              </div>
            </div>
          </div>
        )}

        {/* 2. Performance Tab */}
        {activeTab === 'performance' && (
          <div className="credit-deck">
            <div className="credit-box">
              <div className="credit-box-title">CREATIVE</div>
              <div className="credit-box-content">
                뮤지컬 각색/작사 : 홍우영<br />
                작곡 : 김치영<br />
                연출 : 홍우영<br />
                조연출 : 김소희
              </div>
            </div>

            <div className="credit-box">
              <div className="credit-box-title">MUSIC & SESSION</div>
              <div className="credit-box-content">
                음악감독 : 김다인<br />
                조음악감독 : 공린희 박혜은 조주연<br />
                세션 : 김봉규 김지수 손건 안재영 이성현 이주희 이평안 황민준
              </div>
            </div>

            <div className="credit-box">
              <div className="credit-box-title">STAGE & MOVEMENT</div>
              <div className="credit-box-content">
                안무감독 : 김민<br />
                무대감독 : 김초은<br />
                무대 디자인 : 정승호<br />
                무대 어시스턴트 : 임지민
              </div>
            </div>

            <div className="credit-box">
              <div className="credit-box-title">TECH & DESIGN</div>
              <div className="credit-box-content">
                조명 : 서동현<br />
                무대영상 : 정민재 박민서 최서영 김선우<br />
                의상 : 김지이 전혜은<br />
                소품 : 김가은 윤유민<br />
                분장 : 정하빈
              </div>
            </div>
          </div>
        )}

        {/* 3. Cast Tab */}
        {activeTab === 'cast' && (
          <div>
            <div className="cast-grid-clean">
              {mainCast.map((c) => (
                <div className="cast-card-clean" key={c.id}>
                  {renderPhotoSlot(c)}
                  <div className="cast-role-title">{c.role}</div>
                  <div className="cast-actor-name">{c.name}</div>
                </div>
              ))}
            </div>

            <div className="storytellers-grid-clean">
              {storyCast.map((c) => (
                <div className="cast-card-clean" key={c.id}>
                  {renderPhotoSlot(c)}
                  <div className="cast-role-title">{c.role}</div>
                  <div className="cast-actor-name">{c.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Exhibition Tab */}
        {activeTab === 'exhibition' && (
          <div className="credit-deck">
            <div className="credit-box">
              <div className="credit-box-title">EXHIBITION DIRECTING</div>
              <div className="credit-box-content">
                세계관 기획 : 김명진<br />
                디렉터 : 윤다원<br />
                테크니컬 디렉터 : 정민재<br />
                공간 디자인 : 안형진
              </div>
            </div>

            <div className="credit-box">
              <div className="credit-box-title">ARTISTS</div>
              <div className="credit-box-content">
                정아연 이수연 이영현 차재이 이태하 김형록 조한만 진주 이지혜 고다선 안현준 안형진 김진서 이정원
              </div>
            </div>
          </div>
        )}

        {/* 5. Special Thanks to Tab */}
        {activeTab === 'special-thanks' && (
          <div className="thanks-box-clean">
            <h4>Special Thanks to</h4>
            <div style={{ lineHeight: '1.9' }}>
              <p>기획 assistant 조준민</p>
              <p>무대감독 Special Thanks to 김현서</p>
              <p>무대 Technical director 이규민</p>
              <p>Stage crew 손성령 남우진</p>
              <p>Special thanks to 김예지 임종민 허정우 서연우 곽민선 김가은 이성은 김민채 이지오</p>
              <p>Supported by 무대사랑</p>
              <p>조명 극장식구 Lighting Assistant 김도현</p>
              <p>Followspot Operation 강윤지 배수민 송원석 오동욱</p>
              <p>Electrician 성혜린 박재욱 김가은 박정현 조영서 김효민 송수연 이수림</p>
              <p>무대영상 Special Thanks to 박건 김휘진</p>
              <p>의상 assistant 윤유민 심제민 이석진 이서현 신동윤 서은진 곽원영</p>
            </div>
          </div>
        )}

        {/* 6. Thanks to Tab */}
        {activeTab === 'thanks' && (
          <div className="thanks-columns-clean">
            <div className="thanks-box-clean">
              <h4>Thanks to</h4>
              <p>
                연극 책임교수 : 조경향<br />
                무용 책임교수 : 이우재<br />
                연기 책임교수 : 이은지<br />
                예술경영 책임교수 : 남승헌<br />
                공연기획 지도교수 : 김승미 송희영 이유리<br />
                무대미술 지도교수 : 정승호<br />
                무대조명 지도교수 : 나한수<br />
                무대음향 지도교수 : 안창용 김성식<br />
                무대감독 지도교수 : 김동혁<br />
                무대영상 지도교수 : 김제민<br />
                무대의상 지도교수 : 김상희<br />
                무대메이크업 지도교수 : 이무일<br />
                공연학부 행정조교 : 정현조 곽민기 이시연<br />
                공연학부 기술조교 : 장순호 문성민<br />
                예술경영 행정조교 : 최예은
              </p>
            </div>

            <div className="thanks-box-clean">
              <h4>&lt;창작실습지원센터 &amp; 예술정보센터&gt;</h4>
              <p>
                <strong>창작실습지원센터</strong><br />
                센터장 : 하창용<br />
                창작실습팀장 : 이승훈<br />
                무대공방 : 김예주<br />
                조명 : 윤정주<br />
                음향 : 김경훈 이경민<br />
                영상 : 이승훈<br />
                컴퓨터랩(아카이빙) : 황용회<br />
                아텍 : 김종훈
              </p>
              <hr style={{ border: 0, borderTop: '1px solid var(--border-vintage)', margin: '14px 0' }} />
              <p>
                <strong>예술정보센터</strong><br />
                영상/아카이빙 : 정지윤
              </p>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
