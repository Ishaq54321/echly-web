## Echly Transcript Guard Report

- File modified: `components/CaptureWidget/hooks/useCaptureWidget.ts`
- Lines changed: `503-507`
- Pipeline behavior unchanged: yes, the existing `finishListening() -> onComplete(active.transcript) -> downstream API/ticket pipeline` flow remains in place for valid transcripts
- Short transcripts skipped: yes, empty or trimmed transcripts shorter than 5 characters now return early and do not enter the pipeline
