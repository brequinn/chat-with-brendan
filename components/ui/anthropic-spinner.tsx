import React from 'react'
import styled from 'styled-components'

const SpinnerContainer = styled.div`
<<<<<<< HEAD
 width: 100%;
=======
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`
const SpinnerVideo = styled.video`
  width: 100px;
  height: 100px;
>>>>>>> ccbcf8438f846d56b569e65fd46f6cdbab607636
`

export const AnthropicSpinner = () => {
  return (
    <SpinnerContainer>
<<<<<<< HEAD
      <img width={40} height={40} src="assets/spinner.gif" alt="Loading..." />
=======
      <SpinnerVideo autoPlay loop muted>
        <source src="components/ui/anthropic-spinner.webm" type="video/webm" />
        Your browser does not support the video tag.
      </SpinnerVideo>
>>>>>>> ccbcf8438f846d56b569e65fd46f6cdbab607636
    </SpinnerContainer>
  )
}
