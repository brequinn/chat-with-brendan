import React from 'react'
import styled, { keyframes } from 'styled-components'

const pulsateAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.6;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`

const SpinnerDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #000;
  margin: 0 4px;
  animation: ${pulsateAnimation} 1.5s infinite ease-in-out;

  &:nth-child(1) {
    animation-delay: -0.3s;
  }

  &:nth-child(2) {
    animation-delay: -0.15s;
  }
`

export const AnthropicSpinner = () => {
  return (
    <SpinnerContainer>
      <SpinnerDot />
      <SpinnerDot />
      <SpinnerDot />
    </SpinnerContainer>
  )
}
