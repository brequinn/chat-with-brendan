import React from 'react'
import styled from 'styled-components'

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`
const SpinnerVideo = styled.video`
  width: 100px;
  height: 100px;
`

export const AnthropicSpinner = () => {
  return (
    <SpinnerContainer>
      <SpinnerVideo autoPlay loop muted>
        <source src="components/ui/anthropic-spinner.webm" type="video/webm" />
        Your browser does not support the video tag.
      </SpinnerVideo>
    </SpinnerContainer>
  )
}
