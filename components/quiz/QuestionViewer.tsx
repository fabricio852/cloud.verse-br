import React, { useState, useEffect, useMemo } from 'react';
import { Question, Plano } from '../../types';
import { DomainTag } from '../common/DomainTag';
import { Button, GhostButton } from '../ui/Button';
import { Checkbox } from '../ui/Input';
import { cn, linkAWS } from '../../utils';
import { R } from '../../constants';
import { getAiExplanation } from '../../services/geminiService';

interface QuestionViewerProps {
    questao: Question;
    indice: number;
    total: number;
    onEnviar: (answer: string) => void;
    onProxima: () => void;
    level: 'basic' | 'detailed';
    onPrev?: () => void;
    initialAnswer: string;
    plano: Plano;
    isMarked: boolean;
    onMark: (marked: boolean) => void;
    navAfterBack?: boolean;
}

export const QuestionViewer: React.FC<QuestionViewerProps> = ({
    questao, indice, total, onEnviar, onProxima, level, onPrev, initialAnswer, plano, isMarked, onMark, navAfterBack = false
}) => {
    const [escolha, setEscolha] = useState(initialAnswer || "");
    const [enviado, setEnviado] = useState(!!initialAnswer);
    const [aiExplanation, setAiExplanation] = useState("");
    const [isLoadingAi, setIsLoadingAi] = useState(false);

    useEffect(() => {
        setEscolha(initialAnswer || "");
        setEnviado(!!initialAnswer);
        setAiExplanation("");
    }, [indice, initialAnswer]);

    const handleGetAiExplanation = async () => {
        setIsLoadingAi(true);
        setAiExplanation("");
        try {
            const explanation = await getAiExplanation(questao);
            setAiExplanation(explanation);
        } catch (error: any) {
            setAiExplanation(error.message || "Ocorreu um erro ao buscar la explicação da IA.");
        } finally {
            setIsLoadingAi(false);
        }
    };

    const parsedAiExplanation = useMemo(() => {
        if (!aiExplanation) return "";

        let processedText = aiExplanation
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-purple-600 dark:text-purple-400 underline hover:text-purple-800 dark:hover:text-purple-300">$1</a>');

        const lines = processedText.split('\n');
        let htmlResult = '';
        let inList = false;

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
                if (!inList) {
                    htmlResult += '<ul class="list-disc list-inside my-2 space-y-1">';
                    inList = true;
                }
                htmlResult += `<li>${trimmedLine.substring(2)}</li>`;
            } else {
                if (inList) {
                    htmlResult += '</ul>';
                    inList = false;
                }
                if (trimmedLine) {
                    htmlResult += `<p class="my-2">${trimmedLine}</p>`;
                }
            }
        }
        if (inList) {
            htmlResult += '</ul>';
        }

        return htmlResult;
    }, [aiExplanation]);

    const submit = () => {
        if (!escolha) return;
        setEnviado(true);
        onEnviar(escolha);
    };

    const isLastQuestion = indice + 1 >= total;

    return (
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 p-4" style={{ borderRadius: 12 }}>
            <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">Total de questões: {total}</div>
                <div className="text-xs text-gray-500 dark:text-gray-500">&nbsp;</div>
            </div>
            <div className="mb-2"><DomainTag domain={questao.domain} /></div>
            <div className="flex items-start gap-2 mb-3">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold flex-shrink-0">{indice + 1}</span>
                <div className="font-medium text-gray-900 dark:text-gray-100 flex-grow">{questao.stem}</div>
            </div>
            <div className="space-y-2">
                {Object.entries(questao.options).map(([k, v]) => {
                    const selecionada = escolha === k;
                    const isCerta = enviado && k === questao.answerKey;
                    const isErrada = enviado && selecionada && !isCerta;
                    return (
                        <label key={k} className={cn("flex items-center gap-3 border p-3 cursor-pointer dark:border-gray-700 text-gray-800 dark:text-gray-300 transition-all duration-200 ease-in-out", R.md, selecionada && !enviado && "border-purple-400 dark:border-purple-500 bg-purple-50 dark:bg-gray-700/50 scale-[1.02]", enviado && isCerta && "bg-green-50 dark:bg-green-900/50 border-green-300 dark:border-green-700", enviado && isErrada && "bg-red-50 dark:bg-red-900/50 border-red-300 dark:border-red-700")}>
                            <input type="radio" name={`q-${indice}`} className="text-purple-600 focus:ring-purple-500" checked={selecionada} onChange={() => setEscolha(k)} disabled={enviado} />
                            <div><span className="font-semibold mr-2">{k}.</span>{v}</div>
                        </label>
                    );
                })}
            </div>
            <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {onPrev && <GhostButton onClick={onPrev}>Voltar</GhostButton>}
                    <Checkbox label="Marcar para revisão" checked={isMarked} onChange={onMark} />
                </div>
                <div>
                    {!enviado ? (
                        <Button onClick={submit}>Responder</Button>
                    ) : (
                        <Button onClick={onProxima} disabled={navAfterBack && isLastQuestion}>
                             {navAfterBack && isLastQuestion ? 'Finalize no cabeçalho' : 'Próxima'}
                        </Button>
                    )}
                </div>
            </div>
            {enviado && (
                <>
                    {level === 'basic' ? (
                        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 border dark:border-gray-700 text-sm text-gray-800 dark:text-gray-300" style={{ borderRadius: 10 }}><div className="font-semibold mb-1">Explicação:</div><div>{questao.explanation_basic}</div></div>
                    ) : (
                        <div>
                            <div className="mt-4 p-3 border-2 border-green-600 bg-green-50 dark:bg-green-900/30 text-green-900 dark:text-green-200 text-sm" style={{ borderRadius: 10 }}><div className="font-semibold mb-1">Explicação (correta):</div><div dangerouslySetInnerHTML={{ __html: linkAWS(questao.explanation_detailed) }} /></div>
                            {questao.incorrect && (<div className="mt-3 p-3 border-2 border-red-300 bg-white dark:bg-gray-800 dark:border-red-700/50 text-sm text-gray-800 dark:text-gray-300" style={{ borderRadius: 10 }}><div className="font-semibold text-red-700 dark:text-red-400 mb-1">Por que as outras estão incorretas</div><ul className="list-disc pl-5">{Object.entries(questao.incorrect).filter(([k]) => k !== questao.answerKey).map(([k, txt]) => (<li key={k}><b>{k}.</b> {txt}</li>))}</ul></div>)}
                        </div>
                    )}
                    {plano === 'PRO' && (
                        <>
                            <div className="mt-4">
                                <Button onClick={handleGetAiExplanation} disabled={isLoadingAi} className="w-full text-center flex items-center justify-center gap-2">
                                    {isLoadingAi ? (<><div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Buscando sabedoria na nuvem...</>) : ('✨ Aprendizado profundo')}
                                </Button>
                            </div>
                            {aiExplanation && (
                                <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 text-sm text-gray-800 dark:text-gray-300 rounded-lg">
                                    <div className="font-semibold mb-2 text-purple-800 dark:text-purple-300">Explicação da IA ✨</div>
                                    <div dangerouslySetInnerHTML={{ __html: parsedAiExplanation }} />
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
}