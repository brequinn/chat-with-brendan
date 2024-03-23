import React from 'react'
import styled from 'styled-components'

const SpinnerContainer = styled.div`
 width: 100%;
`

export const AnthropicSpinner = () => {
  return (
    <SpinnerContainer>
      <img width={40} height={40} src="assets/spinner-new.gif" alt="Loading..." />
    </SpinnerContainer>
  )
}
