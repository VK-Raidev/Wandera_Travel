import { useDocumentTitle } from '../hooks/useDocumentTitle'
import LoadingPlaceholder from './LoadingPlaceholder'

function PageFrame({ eyebrow, title, description, loadingLabel, children }) {
  useDocumentTitle(title, description)

  return (
    <section className="page-frame">
      <div className="page-heading">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-description">{description}</p>
      </div>
      <div className="page-body">
        {children || <LoadingPlaceholder label={loadingLabel} />}
      </div>
    </section>
  )
}

export default PageFrame