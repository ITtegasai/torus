import React from 'react'
import ContentLoader from 'react-content-loader'

const TableLoader = props => (
  <ContentLoader
    width='100%'
    height='100%'
    viewBox="0 0 1000 550"
    backgroundColor="#eaeced"
    foregroundColor="#ffffff"
    {...props}
  >
    <rect x="0" y="0" rx="3" ry="3" width="100%" height="58" />
    <rect x="0" y="60" rx="3" ry="3" width="100%" height="58" />
    <rect x="0" y="120" rx="3" ry="3" width="100%" height="58" />
    <rect x="0" y="180" rx="3" ry="3" width="100%" height="58" />
    <rect x="0" y="240" rx="3" ry="3" width="100%" height="58" />
    <rect x="0" y="300" rx="3" ry="3" width="100%" height="58" />
    <rect x="0" y="360" rx="3" ry="3" width="100%" height="58" />
    <rect x="0" y="420" rx="3" ry="3" width="100%" height="58" />
    <rect x="0" y="480" rx="3" ry="3" width="100%" height="58" />
    <rect x="0" y="540" rx="3" ry="3" width="100%" height="58" />
  </ContentLoader>
)
export default TableLoader