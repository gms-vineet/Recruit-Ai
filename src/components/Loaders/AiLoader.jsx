import React from "react";
import styled from "styled-components";

const AiLoader = () => {
  return (
    <StyledWrapper>
      <div className="banter-loader">
        <div className="banter-loader__box" />
        <div className="banter-loader__box" />
        <div className="banter-loader__box" />
        <div className="banter-loader__box" />
        <div className="banter-loader__box" />
        <div className="banter-loader__box" />
        <div className="banter-loader__box" />
        <div className="banter-loader__box" />
        <div className="banter-loader__box" />
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  /* 72 * 1.5 = 108 */
  .banter-loader {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 108px;
    height: 108px;
    margin-left: -54px;
    margin-top: -54px;
  }

  /* 20 * 1.5 = 30, 6 * 1.5 = 9 */
  .banter-loader__box {
    float: left;
    position: relative;
    width: 30px;
    height: 30px;
    margin-right: 9px;
  }

  .banter-loader__box:before {
    content: "";
    position: absolute;
    inset: 0;
    background: #d8b4fe;
    border-radius: 10.5px; /* 7 * 1.5 */
  }

  .banter-loader__box:nth-child(3n) {
    margin-right: 0;
    margin-bottom: 9px;
  }

  /* 26 * 1.5 = 39 */
  .banter-loader__box:nth-child(1):before,
  .banter-loader__box:nth-child(4):before {
    margin-left: 39px;
  }

  /* 52 * 1.5 = 78 */
  .banter-loader__box:nth-child(3):before {
    margin-top: 78px;
  }

  .banter-loader__box:last-child {
    margin-bottom: 0;
  }

  /* ====== KEYFRAMES (scaled) ====== */

  @keyframes moveBox-1 {
    9.0909% {
      transform: translate(-39px, 0);
    }
    18.1818% {
      transform: translate(0, 0);
    }
    27.2727% {
      transform: translate(0, 0);
    }
    36.3636% {
      transform: translate(39px, 0);
    }
    45.4545% {
      transform: translate(39px, 39px);
    }
    54.5454% {
      transform: translate(39px, 39px);
    }
    63.6363% {
      transform: translate(39px, 39px);
    }
    72.7272% {
      transform: translate(39px, 0);
    }
    81.8181% {
      transform: translate(0, 0);
    }
    90.909% {
      transform: translate(-39px, 0);
    }
    100% {
      transform: translate(0, 0);
    }
  }
  .banter-loader__box:nth-child(1) {
    animation: moveBox-1 4s infinite;
  }

  @keyframes moveBox-2 {
    9.0909% {
      transform: translate(0, 0);
    }
    18.1818% {
      transform: translate(39px, 0);
    }
    27.2727% {
      transform: translate(0, 0);
    }
    36.3636% {
      transform: translate(39px, 0);
    }
    45.4545% {
      transform: translate(39px, 39px);
    }
    54.5454% {
      transform: translate(39px, 39px);
    }
    63.6363% {
      transform: translate(39px, 39px);
    }
    72.7272% {
      transform: translate(39px, 39px);
    }
    81.8181% {
      transform: translate(0, 39px);
    }
    90.909% {
      transform: translate(0, 39px);
    }
    100% {
      transform: translate(0, 0);
    }
  }
  .banter-loader__box:nth-child(2) {
    animation: moveBox-2 4s infinite;
  }

  @keyframes moveBox-3 {
    9.0909% {
      transform: translate(-39px, 0);
    }
    18.1818% {
      transform: translate(-39px, 0);
    }
    27.2727% {
      transform: translate(0, 0);
    }
    36.3636% {
      transform: translate(-39px, 0);
    }
    45.4545% {
      transform: translate(-39px, 0);
    }
    54.5454% {
      transform: translate(-39px, 0);
    }
    63.6363% {
      transform: translate(-39px, 0);
    }
    72.7272% {
      transform: translate(-39px, 0);
    }
    81.8181% {
      transform: translate(-39px, -39px);
    }
    90.909% {
      transform: translate(0, -39px);
    }
    100% {
      transform: translate(0, 0);
    }
  }
  .banter-loader__box:nth-child(3) {
    animation: moveBox-3 4s infinite;
  }

  @keyframes moveBox-4 {
    9.0909% {
      transform: translate(-39px, 0);
    }
    18.1818% {
      transform: translate(-39px, 0);
    }
    27.2727% {
      transform: translate(-39px, -39px);
    }
    36.3636% {
      transform: translate(0, -39px);
    }
    45.4545% {
      transform: translate(0, 0);
    }
    54.5454% {
      transform: translate(0, -39px);
    }
    63.6363% {
      transform: translate(0, -39px);
    }
    72.7272% {
      transform: translate(0, -39px);
    }
    81.8181% {
      transform: translate(-39px, -39px);
    }
    90.909% {
      transform: translate(-39px, 0);
    }
    100% {
      transform: translate(0, 0);
    }
  }
  .banter-loader__box:nth-child(4) {
    animation: moveBox-4 4s infinite;
  }

  @keyframes moveBox-5 {
    9.0909% {
      transform: translate(0, 0);
    }
    18.1818% {
      transform: translate(0, 0);
    }
    27.2727% {
      transform: translate(0, 0);
    }
    36.3636% {
      transform: translate(39px, 0);
    }
    45.4545% {
      transform: translate(39px, 0);
    }
    54.5454% {
      transform: translate(39px, 0);
    }
    63.6363% {
      transform: translate(39px, 0);
    }
    72.7272% {
      transform: translate(39px, 0);
    }
    81.8181% {
      transform: translate(39px, -39px);
    }
    90.909% {
      transform: translate(0, -39px);
    }
    100% {
      transform: translate(0, 0);
    }
  }
  .banter-loader__box:nth-child(5) {
    animation: moveBox-5 4s infinite;
  }

  @keyframes moveBox-6 {
    9.0909% {
      transform: translate(0, 0);
    }
    18.1818% {
      transform: translate(-39px, 0);
    }
    27.2727% {
      transform: translate(-39px, 0);
    }
    36.3636% {
      transform: translate(0, 0);
    }
    45.4545% {
      transform: translate(0, 0);
    }
    54.5454% {
      transform: translate(0, 0);
    }
    63.6363% {
      transform: translate(0, 0);
    }
    72.7272% {
      transform: translate(0, 39px);
    }
    81.8181% {
      transform: translate(-39px, 39px);
    }
    90.909% {
      transform: translate(-39px, 0);
    }
    100% {
      transform: translate(0, 0);
    }
  }
  .banter-loader__box:nth-child(6) {
    animation: moveBox-6 4s infinite;
  }

  @keyframes moveBox-7 {
    9.0909% {
      transform: translate(39px, 0);
    }
    18.1818% {
      transform: translate(39px, 0);
    }
    27.2727% {
      transform: translate(39px, 0);
    }
    36.3636% {
      transform: translate(0, 0);
    }
    45.4545% {
      transform: translate(0, -39px);
    }
    54.5454% {
      transform: translate(39px, -39px);
    }
    63.6363% {
      transform: translate(0, -39px);
    }
    72.7272% {
      transform: translate(0, -39px);
    }
    81.8181% {
      transform: translate(0, 0);
    }
    90.909% {
      transform: translate(39px, 0);
    }
    100% {
      transform: translate(0, 0);
    }
  }
  .banter-loader__box:nth-child(7) {
    animation: moveBox-7 4s infinite;
  }

  @keyframes moveBox-8 {
    9.0909% {
      transform: translate(0, 0);
    }
    18.1818% {
      transform: translate(-39px, 0);
    }
    27.2727% {
      transform: translate(-39px, -39px);
    }
    36.3636% {
      transform: translate(0, -39px);
    }
    45.4545% {
      transform: translate(0, -39px);
    }
    54.5454% {
      transform: translate(0, -39px);
    }
    63.6363% {
      transform: translate(0, -39px);
    }
    72.7272% {
      transform: translate(0, -39px);
    }
    81.8181% {
      transform: translate(39px, -39px);
    }
    90.909% {
      transform: translate(39px, 0);
    }
    100% {
      transform: translate(0, 0);
    }
  }
  .banter-loader__box:nth-child(8) {
    animation: moveBox-8 4s infinite;
  }

  @keyframes moveBox-9 {
    9.0909% {
      transform: translate(-39px, 0);
    }
    18.1818% {
      transform: translate(-39px, 0);
    }
    27.2727% {
      transform: translate(0, 0);
    }
    36.3636% {
      transform: translate(-39px, 0);
    }
    45.4545% {
      transform: translate(0, 0);
    }
    54.5454% {
      transform: translate(0, 0);
    }
    63.6363% {
      transform: translate(-39px, 0);
    }
    72.7272% {
      transform: translate(-39px, 0);
    }
    81.8181% {
      transform: translate(-78px, 0); /* 52 * 1.5 */
    }
    90.909% {
      transform: translate(-39px, 0);
    }
    100% {
      transform: translate(0, 0);
    }
  }
  .banter-loader__box:nth-child(9) {
    animation: moveBox-9 4s infinite;
  }
`;

export default AiLoader;
