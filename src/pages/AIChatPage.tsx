// FILE: src/pages/AIChatPage.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Chart, registerables } from 'chart.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Bot, User, SendHorizonal, Loader2, Sparkles, X, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { parseMarkdown } from '@/lib/markdownParser';
import { useNavigate } from 'react-router-dom';
import WorkforceNav from '@/components/WorkforceNav'; // NEW IMPORT

// Register Chart.js components
Chart.register(...registerables);

// Point to the new relative API route (from Vercel's serverless function)
const API_URL = '/api/chatbot';

interface Message {
    id: string;
    content: string;
    isUser: boolean;
    vizData?: any;
    isError?: boolean;
    isLoading?: boolean;
}

const AIChatPage = () => {
    const navigate = useNavigate();
    const [currentQuestion, setCurrentQuestion] = useState<Message | null>(null); // Only store the latest user question
    const [currentAnswer, setCurrentAnswer] = useState<Message | null>(null);     // Only store the latest AI answer
    const [questionInput, setQuestionInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatScrollRef = useRef<HTMLDivElement>(null); // Renamed from chatContainerRef for clarity
    const chartInstances = useRef<Chart[]>([]); // Store Chart.js instances for cleanup

    const exampleQuestions = [
        "Show me employees by department",
        "What are the average performance ratings by department?",
        "How many attractions are in each zone?",
        "What are today's predicted visitors?",
        "What is the average wait time for attractions?",
        "Who is the employee with the highest performance rating?",
        "Show me the total number of confirmed shifts.",
        "How many pending shift requests are there?",
        "What are the staffing targets for today?",
        "Which departments have critical roster health today?",
        "List all skills.",
        "List all certifications.",
        "How many rides are there?",
        "How many shops are there?",
        "How many restaurants are there?",
        "Show me monthly visitor predictions.",
        "Show me monthly staff targets.",
        "List employees with First Aid certification.",
        "List employees with Ride Operation skill.",
        "Which zones contain 'town' in their description?",
        "Show me the latest active admin alert."
    ];

    const scrollToBottom = () => {
        if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
    };

    const clearCharts = () => {
        chartInstances.current.forEach(chart => chart.destroy());
        chartInstances.current = [];
    };

    const createChart = useCallback((vizData: any, messageId: string, chartCanvas: HTMLCanvasElement) => {
        if (!vizData || !vizData.data || vizData.data.length === 0) {
            console.warn("No data or invalid visualization data provided for chart.");
            return;
        }

        const config = vizData.config;
        const data = vizData.data;

        let chartData, chartConfig: any;

        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: config.title,
                    font: { size: 14, weight: 'bold', family: 'Inter, sans-serif' },
                    color: 'hsl(var(--foreground))'
                },
                legend: {
                    display: false,
                    labels: {
                        color: 'hsl(var(--muted-foreground))',
                        font: { family: 'Inter, sans-serif' }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'hsl(var(--border))' },
                    ticks: {
                        color: 'hsl(var(--muted-foreground))',
                        font: { family: 'Inter, sans-serif' },
                        callback: function(value: any) {
                            if (config.y_field && (config.y_field.includes('rating') || config.y_field.includes('percentage'))) {
                                return value.toFixed(1);
                            }
                            if (value >= 1000000) {
                                return `${(value / 1000000).toFixed(1)}M`;
                            } else if (value >= 1000) {
                                return `${(value / 1000).toFixed(1)}K`;
                            }
                            return value.toLocaleString();
                        }
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        color: 'hsl(var(--muted-foreground))',
                        font: { family: 'Inter, sans-serif' },
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        };


        if (vizData.type === 'bar') {
            const labels = data.map((item: any) => {
                const label = item[config.x_field];
                return typeof label === 'string' && label.length > 25
                    ? label.substring(0, 25) + '...'
                    : label;
            });
            const values = data.map((item: any) => parseFloat(item[config.y_field]) || 0);

            chartData = {
                labels: labels,
                datasets: [{
                    label: config.y_field,
                    data: values,
                    backgroundColor: 'hsl(var(--primary))',
                    borderColor: 'hsl(var(--primary-foreground))',
                    borderWidth: 1
                }]
            };

            chartConfig = {
                type: 'bar',
                data: chartData,
                options: commonOptions
            };
        } else if (vizData.type === 'pie') {
            const labels = data.map((item: any) => item[config.label_field]);
            const values = data.map((item: any) => parseFloat(item[config.value_field]) || 0);

            const backgroundColors = [
                'hsl(var(--primary) / 0.7)',
                'hsl(var(--secondary) / 0.7)',
                'hsl(var(--accent) / 0.7)',
                'hsl(var(--warning) / 0.7)',
                'hsl(var(--workspace-teal) / 0.7)',
                'hsl(var(--success) / 0.7)',
                'hsl(var(--destructive) / 0.7)',
            ];
            const borderColors = [
                'hsl(var(--primary) / 1)',
                'hsl(var(--secondary) / 1)',
                'hsl(var(--accent) / 1)',
                'hsl(var(--warning) / 1)',
                'hsl(var(--workspace-teal) / 1)',
                'hsl(var(--success) / 1)',
                'hsl(var(--destructive) / 1)',
            ];

            chartData = {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: backgroundColors.slice(0, labels.length),
                    borderColor: borderColors.slice(0, labels.length),
                    borderWidth: 1
                }]
            };

            chartConfig = {
                type: 'pie',
                data: chartData,
                options: {
                    ...commonOptions,
                    scales: {},
                    plugins: {
                        ...commonOptions.plugins,
                        legend: {
                            position: 'right',
                            labels: {
                                color: 'hsl(var(--muted-foreground))',
                                font: { family: 'Inter, sans-serif' }
                            }
                        }
                    }
                }
            };
        } else if (vizData.type === 'line') {
            const labels = data.map((item: any) => item[config.x_field]);
            const values = data.map((item: any) => parseFloat(item[config.y_field]) || 0);

            chartData = {
                labels: labels,
                datasets: [{
                    label: config.y_field,
                    data: values,
                    borderColor: 'hsl(var(--primary))',
                    backgroundColor: 'hsl(var(--primary) / 0.2)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            };

            chartConfig = {
                type: 'line',
                data: chartData,
                options: commonOptions
            };
        }

        if (chartConfig) {
            const chart = new Chart(chartCanvas, chartConfig);
            chartInstances.current.push(chart);
            // No need to scroll here, useEffect will handle it
        } else {
            console.error("Could not generate chart config for type:", vizData.type);
        }
    }, []);

    const sendQuestion = async (questionText: string) => {
        if (!questionText.trim()) return;

        clearCharts(); // Clear previous charts when a new question is asked

        // Set the new user question
        const newUserMessage: Message = { id: Date.now().toString(), content: questionText, isUser: true };
        setCurrentQuestion(newUserMessage);
        setQuestionInput(''); // Clear input

        // Set a loading AI message
        const newLoadingAIMessage: Message = { id: (Date.now() + 1).toString(), content: 'Thinking...', isUser: false, isLoading: true };
        setCurrentAnswer(newLoadingAIMessage);
        setIsLoading(true);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: questionText })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || errorData.error || 'Failed to get response from AI assistant.');
            }

            const data = await response.json();

            // Update the AI message with actual response
            setCurrentAnswer({
                ...newLoadingAIMessage,
                isLoading: false,
                content: data.answer,
                vizData: data.visualization
            });

            if (data.visualization) {
                setTimeout(() => {
                    const chartWrapper = document.getElementById(`chart-wrapper-${newLoadingAIMessage.id}`);
                    if (chartWrapper) {
                        chartWrapper.innerHTML = ''; // Clear any existing canvas first
                        const chartCanvas = document.createElement('canvas');
                        chartCanvas.className = `w-full h-full`;
                        chartWrapper.appendChild(chartCanvas);
                        createChart(data.visualization, newLoadingAIMessage.id, chartCanvas);
                    } else {
                        console.error("Chart wrapper not found for message:", newLoadingAIMessage.id);
                    }
                }, 100);
            }
        } catch (error: any) {
            setCurrentAnswer({
                ...newLoadingAIMessage,
                isLoading: false,
                isError: true,
                content: `Error: ${error.message}`
            });
        } finally {
            setIsLoading(false);
            // Scrolling is handled by useEffect on currentAnswer update
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !isLoading) {
            sendQuestion(questionInput);
        }
    };

    // Initial message on load, and cleanup
    useEffect(() => {
        setCurrentAnswer({ id: Date.now().toString(), content: 'Hello! Ask me anything about Peakville Park data. 🎢', isUser: false });
        return () => {
            clearCharts(); // Destroy chart instances when component unmounts
        };
    }, []);

    // Scroll to bottom whenever currentQuestion or currentAnswer updates
    useEffect(() => {
        // Only scroll if there's content to scroll to and not actively loading (which might cause jumpiness)
        if (!isLoading && chatScrollRef.current) {
            scrollToBottom();
        }
    }, [currentQuestion, currentAnswer, isLoading]);


    return (
        <div className="flex flex-col min-h-screen bg-page-background">
            <WorkforceNav /> {/* Added WorkforceNav component here */}
            
            <main className="flex-1 overflow-hidden flex flex-col container mx-auto py-8"> {/* Adjusted py-8 for spacing below navbar */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1 h-full">
                    {/* Example Questions Sidebar */}
                    <Card className="col-span-1 bg-card/80 backdrop-blur-sm shadow-lg overflow-y-auto hidden md:flex flex-col">
                        <Card className="p-4 bg-primary text-primary-foreground rounded-b-none">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Bot className="h-5 w-5" /> Try asking...
                            </h3>
                        </Card>
                        <ScrollArea className="flex-1 p-4">
                            <ul className="space-y-3">
                                {exampleQuestions.map((q, index) => (
                                    <li key={index}>
                                        <Button
                                            variant="ghost"
                                            className="w-full text-left justify-start h-auto p-2 text-sm text-foreground/80 hover:bg-muted/50 hover:text-foreground"
                                            onClick={() => {
                                                setQuestionInput(q);
                                                sendQuestion(q);
                                            }}
                                            disabled={isLoading}
                                        >
                                            {q}
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </ScrollArea>
                    </Card>

                    {/* Chat Area */}
                    <div className="md:col-span-3 flex flex-col bg-card/80 backdrop-blur-sm rounded-lg shadow-lg">
                        <ScrollArea ref={chatScrollRef} className="flex-1 p-6">
                            <div className="flex flex-col gap-4">
                                {/* Only display current question */}
                                {currentQuestion && (
                                    <div className="flex justify-end">
                                        <div className="max-w-[70%] flex flex-col gap-2 items-end">
                                            <Card className="p-3 rounded-lg text-sm bg-primary text-primary-foreground rounded-br-none prose dark:prose-invert max-w-none">
                                                <div dangerouslySetInnerHTML={{ __html: parseMarkdown(currentQuestion.content) }} />
                                            </Card>
                                        </div>
                                    </div>
                                )}
                                {/* Only display current answer */}
                                {currentAnswer && (
                                    <div className="flex justify-start">
                                        <div className="max-w-[70%] flex flex-col gap-2 items-start">
                                            <Card className={cn(
                                                "p-3 rounded-lg text-sm prose dark:prose-invert max-w-none",
                                                currentAnswer.isUser ? "bg-primary text-primary-foreground rounded-br-none" : "bg-background text-foreground rounded-bl-none border border-border/50 shadow-sm",
                                                currentAnswer.isError && "bg-destructive/10 text-destructive border-destructive"
                                            )}>
                                                {currentAnswer.isLoading ? (
                                                    <div className="flex items-center gap-2 text-primary">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        <span>Thinking...</span>
                                                    </div>
                                                ) : (
                                                    <div dangerouslySetInnerHTML={{ __html: parseMarkdown(currentAnswer.content) }} />
                                                )}
                                            </Card>

                                            {currentAnswer.vizData && !currentAnswer.isLoading && (
                                                <Card className="mt-2 p-4 rounded-lg shadow-sm w-full max-w-full">
                                                    <div id={`chart-wrapper-${currentAnswer.id}`} className="relative h-64 w-full">
                                                        {/* Chart.js will render into a canvas here */}
                                                    </div>
                                                </Card>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="p-4 border-t border-border bg-card/50">
                            <div className="flex w-full gap-2">
                                <Input
                                    placeholder="Ask a question about park data..."
                                    value={questionInput}
                                    onChange={(e) => setQuestionInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={isLoading}
                                    className="flex-1 text-base h-11"
                                />
                                <Button onClick={() => sendQuestion(questionInput)} disabled={isLoading || questionInput.trim() === ''} className="h-11 px-6">
                                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <SendHorizonal className="h-5 w-5" />}
                                    <span className="sr-only">Send</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AIChatPage;