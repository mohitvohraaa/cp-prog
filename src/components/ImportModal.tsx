'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { parseA2OJMarkdownTable, parseJSON, parseCSV } from '@/lib/parser'
import { Ladder } from '@/lib/types'
import { Upload, FileJson, FileText, Table, AlertCircle, Check, Loader2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ImportModalProps {
  open: boolean
  onClose: () => void
}

type ParseStage = 'idle' | 'parsing' | 'preview' | 'error'

export function ImportModal({ open, onClose }: ImportModalProps) {
  const [input, setInput] = useState('')
  const [stage, setStage] = useState<ParseStage>('idle')
  const [preview, setPreview] = useState<Ladder | null>(null)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  
  const addLadder = useStore(s => s.addLadder)
  
  const handleParse = () => {
    if (!input.trim()) return
    setStage('parsing')
    setError('')
    
    setTimeout(() => {
      let result: Ladder | null = null
      
      // Try markdown first
      if (input.includes('|') && input.includes('Problem Name')) {
        result = parseA2OJMarkdownTable(input)
      }
      // Try JSON
      else if (input.trim().startsWith('[') || input.trim().startsWith('{')) {
        result = parseJSON(input)
      }
      // Try CSV
      else if (input.includes(',')) {
        result = parseCSV(input)
      }
      // Try markdown anyway
      else {
        result = parseA2OJMarkdownTable(input)
      }
      
      if (result && result.problems.length > 0) {
        setPreview(result)
        setStage('preview')
      } else {
        setError('Could not parse the data. Please check the format.')
        setStage('error')
      }
    }, 600)
  }
  
  const handleImport = () => {
    if (!preview) return
    addLadder(preview)
    setInput('')
    setStage('idle')
    setPreview(null)
    onClose()
  }
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }
  
  const handleDragLeave = () => {
    setDragOver(false)
  }
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setInput(e.target?.result as string)
      }
      reader.readAsText(file)
    }
  }
  
  if (!open) return null
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl bg-[#0f1420] border border-[#1e293b] rounded-xl shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b]">
            <div className="flex items-center gap-3">
              <Upload className="w-5 h-5 text-[#00f0ff]" />
              <h2 className="text-lg font-semibold text-white">Import Ladder</h2>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-[#1e293b] transition-colors">
              <X className="w-4 h-4 text-[#64748b]" />
            </button>
          </div>
          
          <div className="p-6">
            {stage === 'idle' && (
              <div className="space-y-4">
                <div 
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    dragOver ? 'border-[#00f0ff] bg-[#00f0ff]/5' : 'border-[#1e293b] hover:border-[#334155]'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className="w-8 h-8 text-[#64748b] mx-auto mb-3" />
                  <p className="text-sm text-[#94a3b8]">Drag & drop a file or paste data below</p>
                  <p className="text-xs text-[#475569] mt-1">Supports Markdown, JSON, CSV</p>
                </div>
                
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Paste your ladder data here (Markdown table, JSON, CSV, or raw text)..."
                  className="w-full h-40 bg-[#060b14] border border-[#1e293b] rounded-lg p-4 text-sm text-[#e2e8f0] placeholder-[#475569] outline-none focus:border-[#00f0ff]/50 resize-none font-mono"
                />
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleParse}
                    disabled={!input.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-[#00f0ff]/10 border border-[#00f0ff]/20 text-[#00f0ff] rounded-lg text-sm font-medium hover:bg-[#00f0ff]/15 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FileText className="w-4 h-4" />
                    Parse Data
                  </button>
                </div>
              </div>
            )}
            
            {stage === 'parsing' && (
              <div className="py-12 text-center">
                <Loader2 className="w-8 h-8 text-[#00f0ff] animate-spin mx-auto mb-4" />
                <p className="text-sm text-[#94a3b8]">Parsing intelligence data...</p>
              </div>
            )}
            
            {stage === 'error' && (
              <div className="py-8 text-center">
                <AlertCircle className="w-8 h-8 text-[#ff3366] mx-auto mb-3" />
                <p className="text-sm text-[#ff3366]">{error}</p>
                <button
                  onClick={() => setStage('idle')}
                  className="mt-4 px-4 py-2 bg-[#1e293b] rounded-lg text-sm text-white hover:bg-[#334155] transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
            
            {stage === 'preview' && preview && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#00ff88]">
                  <Check className="w-5 h-5" />
                  <span className="text-sm font-medium">Successfully parsed {preview.problems.length} problems</span>
                </div>
                
                <div className="bg-[#060b14] rounded-lg border border-[#1e293b] p-4">
                  <h3 className="text-sm font-semibold text-white mb-1">{preview.name}</h3>
                  <p className="text-xs text-[#64748b]">{preview.description}</p>
                  <div className="mt-3 flex items-center gap-4 text-xs font-mono">
                    <span className="text-[#00f0ff]">{preview.problems.length} problems</span>
                    <span className="text-[#64748b]">|
                    </span>
                    <span className="text-[#ffb800]">Diff 1-4</span>
                  </div>
                </div>
                
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {preview.problems.slice(0, 10).map(p => (
                    <div key={p.id} className="flex items-center gap-3 px-3 py-2 text-xs bg-[#060b14] rounded border border-[#1e293b]">
                      <span className="font-mono text-[#64748b] w-6">{p.index}</span>
                      <span className="flex-1 text-[#94a3b8] truncate">{p.name}</span>
                      <span className={`difficulty-badge diff-${p.difficulty}`}>DIFF {p.difficulty}</span>
                    </div>
                  ))}
                  {preview.problems.length > 10 && (
                    <p className="text-xs text-[#475569] text-center py-2">...and {preview.problems.length - 10} more</p>
                  )}
                </div>
                
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleImport}
                    className="flex items-center gap-2 px-4 py-2 bg-[#00ff88]/10 border border-[#00ff88]/20 text-[#00ff88] rounded-lg text-sm font-medium hover:bg-[#00ff88]/15 transition-all"
                  >
                    <Check className="w-4 h-4" />
                    Import Ladder
                  </button>
                  <button
                    onClick={() => setStage('idle')}
                    className="px-4 py-2 text-sm text-[#64748b] hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
