import { useState, useRef, useEffect } from 'react';
import { Download, Copy, Lightbulb, History, FileText, Edit, Wand2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useChat, type Message } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { generatePolicy } from '@/lib/openai';

export function ChatInterface() {
  const { messages, addMessage, setMessages } = useChat();
  const policyContentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [currentVersion, setCurrentVersion] = useState('v1.0.0');
  const [selectedText, setSelectedText] = useState('');
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editPosition, setEditPosition] = useState({ x: 0, y: 0 });
  const [isProcessingEdit, setIsProcessingEdit] = useState(false);
  const [editMode, setEditMode] = useState<'prompt' | 'quick' | 'advanced'>('prompt');
  const [quickEditOptions, setQuickEditOptions] = useState([
    { id: 'simplify', label: 'Simplify', prompt: 'Simplify this text to make it easier to understand while preserving the meaning.' },
    { id: 'formal', label: 'Make Formal', prompt: 'Make this text more formal and professional.' },
    { id: 'expand', label: 'Expand', prompt: 'Expand this text with more details and examples.' },
    { id: 'concise', label: 'Make Concise', prompt: 'Make this text more concise while preserving the key information.' },
  ]);
  
  // Version history state
  const [versionHistory, setVersionHistory] = useState([
    { version: 'v1.0.0', date: '2025-05-27', changes: 'Initial policy creation', content: '' },
  ]);

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: 'The policy content has been copied to your clipboard.',
    });
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: 'Downloaded',
      description: `${filename}.md has been downloaded.`,
    });
  };

  const handleVersionSelect = (version: string) => {
    // Find the selected version in history
    const selectedVersion = versionHistory.find(v => v.version === version);
    
    if (selectedVersion && selectedVersion.content && policyMessage) {
      // Update the displayed content with the version's content
      setMessages(prev => {
        return prev.map(msg => {
          if (msg.id === policyMessage.id) {
            return { ...msg, content: selectedVersion.content };
          }
          return msg;
        });
      });
    }
    
    setCurrentVersion(version);
    toast({
      title: 'Version changed',
      description: `Viewing policy version ${version}`,
    });
  };

  // Handle text selection in the policy document
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      return;
    }

    const text = selection.toString().trim();
    if (text) {
      setSelectedText(text);
      
      // Get position for the edit tooltip
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      // Get the policy content container position for relative positioning
      const policyContainer = policyContentRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
      
      // Calculate position relative to the viewport
      setEditPosition({
        x: rect.left + (rect.width / 2) - scrollLeft,
        y: rect.top - scrollTop - 10 // Position above the selection
      });
      
      setIsEditing(true);
    }
  };

  // Handle quick edit option selection
  const handleQuickEditSelect = (optionId: string) => {
    const selectedOption = quickEditOptions.find(option => option.id === optionId);
    if (selectedOption) {
      setEditPrompt(selectedOption.prompt);
      setEditMode('prompt');
    }
  };

  // Handle edit prompt submission
  const handleEditSubmit = async () => {
    if (!selectedText || !policyMessage) {
      return;
    }

    // In prompt mode, we need an edit prompt
    if (editMode === 'prompt' && !editPrompt.trim()) {
      return;
    }

    setIsProcessingEdit(true);
    try {
      // Create a prompt for the edit based on the mode
      let editRequestPrompt = '';
      
      if (editMode === 'prompt') {
        editRequestPrompt = `
          I have a policy document with the following text segment that needs to be edited:
          """${selectedText}"""
          
          I want to edit it according to this instruction: "${editPrompt}"
          
          Please provide ONLY the edited version of this text segment. Maintain the same style, tone, and formatting as the original.
          Do not include any explanations, notes, or additional text. Just return the edited segment.
        `;
      } else if (editMode === 'advanced') {
        // Advanced mode uses a more detailed prompt
        editRequestPrompt = `
          I have a policy document with the following text segment that needs to be edited:
          """${selectedText}"""
          
          I want to edit it according to this instruction: "${editPrompt}"
          
          Please provide ONLY the edited version of this text segment. Consider the following aspects:
          - Maintain the same formal tone appropriate for a policy document
          - Ensure clarity and precision in language
          - Preserve any legal or regulatory requirements
          - Improve readability and comprehension
          - Keep consistent terminology throughout
          - Maintain any existing formatting like bullet points, numbering, or paragraph structure
          
          Return ONLY the edited text without any explanations, notes, or additional content.
        `;
      }

      // Generate the edited text
      const editedText = await generatePolicy(editRequestPrompt);
      
      // Clean up the edited text to remove any potential AI explanations
      const cleanedEditedText = editedText
        .trim()
        .replace(/^Here is the edited version[^:]*:\s*/i, '')
        .replace(/^Edited version[^:]*:\s*/i, '')
        .replace(/^Edited text[^:]*:\s*/i, '')
        .replace(/^Here's the edited text[^:]*:\s*/i, '')
        .replace(/^The edited text[^:]*:\s*/i, '')
        .replace(/\n*I have edited[^.]*.$/i, '')
        .replace(/\n*I've edited[^.]*.$/i, '')
        .trim();
      
      // Escape special characters in the selected text for regex
      const escapedSelectedText = selectedText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Replace the selected text in the policy content
      const updatedContent = policyMessage.content.replace(
        new RegExp(escapedSelectedText, 'g'), 
        cleanedEditedText
      );
      
      // Create a new version number
      const currentVersionNum = parseFloat(currentVersion.substring(1));
      const newVersionNum = Math.round((currentVersionNum + 0.1) * 10) / 10; // Ensure proper decimal formatting
      const newVersion = `v${newVersionNum.toFixed(1)}`;
      
      // Add the new version to history
      const newVersionEntry = {
        version: newVersion,
        date: new Date().toISOString().split('T')[0],
        changes: `Edited: "${selectedText.substring(0, 20)}${selectedText.length > 20 ? '...' : ''}"`,
        content: updatedContent
      };
      
      // Update the policy content
      setMessages(prev => {
        return prev.map(msg => {
          if (msg.id === policyMessage.id) {
            return { ...msg, content: updatedContent };
          }
          return msg;
        });
      });
      
      // Update version history
      setVersionHistory(prev => [newVersionEntry, ...prev]);
      setCurrentVersion(newVersion);
      
      toast({
        title: 'Policy updated',
        description: 'Your edit has been applied successfully.',
      });
    } catch (error) {
      console.error('Error editing policy:', error);
      toast({
        title: 'Edit failed',
        description: 'Failed to apply your edit. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessingEdit(false);
      setIsEditing(false);
      setEditPrompt('');
      setSelectedText('');
    }
  };

  // Close the edit popover
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditPrompt('');
    setSelectedText('');
  };

  // Get the latest policy message or an empty state message
  const getPolicyContent = () => {
    if (messages.length === 0) {
      return null;
    }
    
    // Find the most recent assistant message that contains policy content
    const policyMessages = messages.filter(
      (msg) => msg.type === 'assistant' && !msg.id.startsWith('loading-')
    );
    
    return policyMessages.length > 0 ? policyMessages[policyMessages.length - 1] : null;
  };

  const policyMessage = getPolicyContent();
  
  // Add event listener for text selection
  useEffect(() => {
    const policyElement = policyContentRef.current;
    if (policyElement) {
      policyElement.addEventListener('mouseup', handleTextSelection);
      return () => {
        policyElement.removeEventListener('mouseup', handleTextSelection);
      };
    }
  }, [policyContentRef.current]);
  
  // Function to process content and handle HTML tags, remove table of contents, and remove quotes
  const processContent = (content: string): string => {
    if (!content) return '';
    
    // Replace centered div tags with markdown headings
    let processed = content.replace(/<div[^>]*align=["']center["'][^>]*>(.*?)<\/div>/gs, '# $1');
    
    // Replace any remaining div tags with their content
    processed = processed.replace(/<div[^>]*>(.*?)<\/div>/gs, '$1');
    
    // Clean up any other HTML tags that might be causing issues
    processed = processed.replace(/<\/?[^>]+(>|$)/g, '');
    
    // Remove table of contents section
    processed = processed.replace(/## Table of Contents[\s\S]*?(?=##)/g, '');
    
    // Also remove any markdown-style table of contents
    processed = processed.replace(/\*\*Table of Contents\*\*[\s\S]*?(?=##)/g, '');
    processed = processed.replace(/Table of Contents[\s\S]*?(?=##)/g, '');
    
    // Remove any numbered list that looks like a TOC (lines with numbers and links)
    processed = processed.replace(/(?:^|\n)\d+\. \[.*?\]\(.*?\)(?:\n|$)/g, '\n');
    
    // Remove quotes that might appear in the text
    processed = processed.replace(/^"(.*)"$/gms, '$1'); // Remove surrounding quotes
    processed = processed.replace(/^```[\s\S]*?```$/gm, ''); // Remove code blocks
    processed = processed.replace(/^> (.*)$/gm, '$1'); // Remove blockquotes
    processed = processed.replace(/"""([\s\S]*?)"""/g, '$1'); // Remove triple quotes
    
    return processed;
  };

  // Initialize version history with initial policy content when it's first loaded
  useEffect(() => {
    if (policyMessage && versionHistory.length === 1 && !versionHistory[0].content) {
      // Update the initial version with the policy content
      setVersionHistory(prev => [
        { ...prev[0], content: policyMessage.content },
        ...prev.slice(1)
      ]);
    }
  }, [policyMessage]);

  return (
    <div className="flex h-full relative">
      {/* Edit popover that appears when text is selected */}
      {isEditing && (
        <div 
          className="fixed z-50 bg-card rounded-lg shadow-md border p-4 w-80"
          style={{
            left: `${editPosition.x}px`,
            top: `${editPosition.y}px`,
            transform: 'translate(-50%, -100%)',
            filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
          }}
        >
          {/* Tooltip arrow */}
          <div 
            className="absolute w-3 h-3 bg-card rotate-45"
            style={{
              left: '50%',
              bottom: '-6px',
              marginLeft: '-6px',
              borderRight: '1px solid',
              borderBottom: '1px solid',
              borderColor: 'hsl(var(--border))'
            }}
          />
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium">Edit Selected Text</h4>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={handleCancelEdit}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="mb-3 p-2 bg-muted rounded text-xs">
            <p className="line-clamp-3">{selectedText}</p>
          </div>
          
          {/* Edit mode tabs */}
          <div className="flex border-b mb-3">
            <button
              className={`px-3 py-1 text-xs ${editMode === 'quick' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
              onClick={() => setEditMode('quick')}
            >
              Quick Edit
            </button>
            <button
              className={`px-3 py-1 text-xs ${editMode === 'prompt' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
              onClick={() => setEditMode('prompt')}
            >
              Custom
            </button>
            <button
              className={`px-3 py-1 text-xs ${editMode === 'advanced' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
              onClick={() => setEditMode('advanced')}
            >
              Advanced
            </button>
          </div>
          
          {/* Quick edit options */}
          {editMode === 'quick' && (
            <div className="grid grid-cols-2 gap-2 mb-3">
              {quickEditOptions.map((option) => (
                <Button
                  key={option.id}
                  variant="outline"
                  size="sm"
                  className="text-xs justify-start h-auto py-2"
                  onClick={() => handleQuickEditSelect(option.id)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          )}
          
          {/* Custom prompt input */}
          {(editMode === 'prompt' || editMode === 'advanced') && (
            <Textarea
              placeholder={editMode === 'advanced' 
                ? "Enter detailed editing instructions..." 
                : "Enter your edit instructions..."}
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              className="min-h-[80px] text-sm mb-3"
            />
          )}
          
          {/* Action buttons */}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelEdit}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleEditSubmit}
              disabled={isProcessingEdit || (editMode !== 'quick' && !editPrompt.trim())}
              className="text-xs flex items-center gap-1"
            >
              {isProcessingEdit ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Processing...
                </>
              ) : (
                <>
                  <Wand2 className="h-3 w-3" />
                  Apply Edit
                </>
              )}
            </Button>
          </div>
        </div>
      )}
      
      {/* Main policy display area */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center p-3 border-b">
          <h2 className="text-lg font-semibold">Policy Document</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setShowVersionHistory(!showVersionHistory)}
          >
            <History className="h-3 w-3" />
            Version History
          </Button>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-4xl mx-auto w-full" ref={policyContentRef}>
            {!policyMessage ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <FileText className="w-12 h-12 mb-4 text-primary/30" />
                <h3 className="text-lg font-medium">No policy generated yet</h3>
                <p className="text-sm">Use the policy generator to create a new policy</p>
              </div>
            ) : (
              <div className="relative group">
                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 px-2 text-xs flex items-center gap-1"
                    onClick={() => handleCopyToClipboard(policyMessage.content)}
                  >
                    <Copy className="h-3 w-3" />
                    Copy
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 px-2 text-xs flex items-center gap-1"
                    onClick={() => handleDownload(policyMessage.content, 'policy')}
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </Button>
                </div>
                
                <div className="bg-card rounded-lg p-6 shadow-sm border">
                  <div className="mb-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-primary">{currentVersion}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {versionHistory.find(v => v.version === currentVersion)?.date || 'Current'}
                    </span>
                  </div>
                  
                  <div className={cn(
                    "prose prose-sm dark:prose-invert max-w-none",
                    "prose-headings:text-primary prose-headings:font-bold prose-h1:text-xl prose-h2:text-lg prose-p:text-sm prose-hr:my-4 prose-hr:border-primary/20 prose-em:text-muted-foreground prose-em:italic"
                  )}>
                    {/* Process content to remove HTML div tags before rendering */}
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-primary mb-6 text-center" {...props} />,
                        h2: ({ node, ...props }) => <h2 className="text-lg font-semibold text-primary/90 mt-6 mb-3" {...props} />,
                        h3: ({ node, ...props }) => <h3 className="text-md font-medium text-primary/80 mt-5 mb-2" {...props} />,
                        hr: ({ node, ...props }) => <hr className="my-4 border-primary/20" {...props} />,
                        em: ({ node, ...props }) => <em className="text-muted-foreground italic" {...props} />,
                        ul: ({ node, ...props }) => <ul className="my-2 list-disc pl-6" {...props} />,
                        ol: ({ node, ...props }) => <ol className="my-2 list-decimal pl-6" {...props} />,
                        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                        p: ({ node, ...props }) => <p className="my-2" {...props} />,
                      }}
                    >
                      {/* Process content to remove HTML div tags */}
                      {processContent(policyMessage.content)}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      
      {/* Version history panel */}
      {showVersionHistory && (
        <div className="w-64 border-l bg-card p-4 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">Version History</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={() => setShowVersionHistory(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </Button>
          </div>
          <div className="space-y-3">
            {versionHistory.map((version, index) => (
              <div 
                key={index} 
                className={cn(
                  "p-2 border rounded-md hover:bg-muted cursor-pointer",
                  currentVersion === version.version && "bg-muted border-primary/50"
                )}
                onClick={() => handleVersionSelect(version.version)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-primary">{version.version}</span>
                  <span className="text-xs text-muted-foreground">{version.date}</span>
                </div>
                <p className="text-xs">{version.changes}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
