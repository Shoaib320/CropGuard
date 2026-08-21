'use client'

import { useLabels } from '@/components/locale-provider'

type LoadingKind = 'fieldReport' | 'diseaseReference'

export function LocalizedLoading({ kind }: { kind: LoadingKind }) {
  const { copy } = useLabels()

  return (
    <div className="route-main">
      <p className="loading-note">
        {kind === 'fieldReport'
          ? copy.loadingFieldReport
          : copy.loadingDiseaseReference}
      </p>
    </div>
  )
}
