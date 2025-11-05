// FILE: src/components/AIChatSheet.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Chart, registerables } from 'chart.js'; // Import Chart.js and registerables
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Bot, User, SendHorizonal, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming this utility function is for Tailwind class merging

// Register Chart.js components
Chart.register(...registerables);

// Point to the new relative API route
const API_URL = '/api/chatbot';

interface Message {
    id: string;
    content: string;
    isUser: boolean;
    vizData?: any;
    isError?: boolean;
    isLoading?: boolean;
}

const AIChatSheet = ({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (open: boolean) => void }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [questionInput, setQuestionInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const chartInstances = useRef<Chart[]>([]); // Store Chart.js instances for cleanup

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    const addMessage = useCallback((content: string, isUser: boolean, vizData?: any, isError?: boolean, isLoading?: boolean) => {
        const newMessage: Message = { id: Date.now().toString(), content, isUser, vizData, isError, isLoading };
        setMessages((prev) => [...prev, newMessage]);
        return newMessage;
    }, []);

    const updateMessage = useCallback((id: string, updates: Partial<Message>) => {
        setMessages((prev) =>
            prev.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg))
        );
    }, []);

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

        // Common Chart.js options for styling
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
                    display: false, // Default to false, specific charts can override
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
                                return value.toFixed(1); // Specific formatting for ratings/percentages
                            }
                            if (value >= 1000000) {
                                return `${(value / 1000000).toFixed(1)}M`;
                            } else if (value >= 1000) {
                                return `${(value / 1000).toFixed(1)}K`;
                            }
                            return value.toLocaleString(); // Default formatting for numbers
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

            // Using your theme's accent colors
            const backgroundColors = [
                'hsl(var(--primary) / 0.7)',
                'hsl(var(--secondary) / 0.7)',
                'hsl(var(--accent) / 0.7)',
                'hsl(var(--warning) / 0.7)', // You have warning color defined
                'hsl(var(--workspace-teal) / 0.7)', // You have workspace-teal color defined
                'hsl(var(--success) / 0.7)', // You have success color defined
                'hsl(var(--destructive) / 0.7)', // Destructive as a fallback
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
                    scales: {}, // Pie charts don't use X/Y scales
                    plugins: {
                        ...commonOptions.plugins,
                        legend: {
                            position: 'right', // Override for pie chart
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
            scrollToBottom();
        } else {
            console.error("Could not generate chart config for type:", vizData.type);
        }
    }, []);

    const sendQuestion = async () => {
        const question = questionInput.trim();
        if (!question) return;

        addMessage(question, true);
        setQuestionInput('');
        setIsLoading(true);

        const loadingMsg = addMessage('', false, undefined, false, true);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: question })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || errorData.error || 'Failed to get response from AI assistant.');
            }

            const data = await response.json();

            updateMessage(loadingMsg.id, { isLoading: false, content: data.answer });

            if (data.visualization) {
                const chartWrapper = document.getElementById(`chart-wrapper-${loadingMsg.id}`);
                if (chartWrapper) {
                    const chartCanvas = document.createElement('canvas');
                    chartCanvas.className = `w-full h-full`; // Tailwind classes
                    chartWrapper.appendChild(chartCanvas);
                    createChart(data.visualization, loadingMsg.id, chartCanvas);
                } else {
                    console.error("Chart wrapper not found for message:", loadingMsg.id);
                }
            }
        } catch (error: any) {
            updateMessage(loadingMsg.id, { isLoading: false, isError: true, content: `Error: ${error.message}` });
        } finally {
            setIsLoading(false);
            scrollToBottom();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !isLoading) {
            sendQuestion();
        }
    };

    useEffect(() => {
        if (isOpen) {
            addMessage('Hello! Ask me anything about Peakville Park data. 🎢', false);
            // Optionally fetch data sources here if needed for initial greeting
            // fetch(`${API_URL}/api/datasources`).then(res => res.json()).then(data => addMessage(`Available data: ${data.sources.join(', ')}`, false));
        } else {
            setMessages([]); // Clear messages when sheet closes
            clearCharts(); // Destroy chart instances
        }
    }, [isOpen, addMessage]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        return () => {
            clearCharts(); // Cleanup charts when component unmounts
        };
    }, []);

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="flex flex-col w-[450px] sm:w-[540px] border-l-2 border-primary/20 bg-gradient-to-br from-background via-card to-card/90 backdrop-blur-sm shadow-2xl">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2 text-2xl font-bold text-foreground">
                        <Sparkles className="h-6 w-6 text-primary" /> Peakville AI Chat
                    </SheetTitle>
                    <SheetDescription className="text-muted-foreground">
                        Get insights from your park data. Try "total employees" or "attractions per zone".
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea ref={chatContainerRef} className="flex-1 px-4 py-6 bg-muted/20 rounded-md">
                    <div className="flex flex-col gap-4">
                        {messages.map((msg) => (
                            <div key={msg.id} className={cn("flex", msg.isUser ? "justify-end" : "justify-start")}>
                                {/* Message bubble */}
                                <div className={cn("max-w-[80%] flex flex-col gap-2", msg.isUser ? "items-end" : "items-start")}>
                                    <Card
                                        className={cn(
                                            "p-3 rounded-lg text-sm",
                                            msg.isUser
                                                ? "bg-primary text-primary-foreground rounded-br-none"
                                                : "bg-background text-foreground rounded-bl-none border border-border/50",
                                            msg.isError && "bg-destructive/10 text-destructive border-destructive"
                                        )}
                                    >
                                        {msg.isLoading ? (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                                <span>Thinking...</span>
                                            </div>
                                        ) : (
                                            <div dangerouslySetInnerHTML={{ __html: msg.content }} />
                                        )}
                                    </Card>

                                    {/* Visualization container, appears below the message content */}
                                    {msg.vizData && !msg.isLoading && (
                                        <Card className="mt-2 p-4 rounded-lg shadow-sm w-full max-w-full">
                                            <div id={`chart-wrapper-${msg.id}`} className="relative h-64 w-full">
                                                {/* Chart.js will render into a canvas here */}
                                            </div>
                                        </Card>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <SheetFooter className="mt-4 p-0">
                    <div className="flex w-full gap-2">
                        <Input
                            placeholder="Ask a question about park data..."
                            value={questionInput}
                            onChange={(e) => setQuestionInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                            className="flex-1 text-base h-11"
                        />
                        <Button onClick={sendQuestion} disabled={isLoading || questionInput.trim() === ''} className="h-11 px-6">
                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <SendHorizonal className="h-5 w-5" />}
                            <span className="sr-only">Send</span>
                        </Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};

export default AIChatSheet;