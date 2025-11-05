"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { extractAndStructureData } from "@/ai/flows/extract-and-structure-data";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { Proposal } from "@/lib/types";

const extractFormSchema = z.object({
  documentText: z.string().min(10, {
    message: "O texto do documento deve ter pelo menos 10 caracteres.",
  }),
});

const proposalFormSchema = z.object({
  clientName: z.string().min(2, "Nome é obrigatório."),
  cpf: z.string().min(14, "CPF é obrigatório e deve estar no formato correto."),
  loanAmount: z.coerce.number().positive("O valor deve ser positivo."),
  email: z.string().email("E-mail inválido."),
  phone: z.string().min(10, "Telefone inválido."),
});

interface DataExtractorProps {
  onDataExtracted: (data: Proposal) => void;
}

export default function DataExtractor({ onDataExtracted }: DataExtractorProps) {
  const { toast } = useToast();
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<Partial<Proposal> | null>(null);

  const extractForm = useForm<z.infer<typeof extractFormSchema>>({
    resolver: zodResolver(extractFormSchema),
    defaultValues: { documentText: "" },
  });

  const proposalForm = useForm<z.infer<typeof proposalFormSchema>>({
    resolver: zodResolver(proposalFormSchema),
  });

  const handleExtract = async (values: z.infer<typeof extractFormSchema>) => {
    setIsExtracting(true);
    try {
      const result = await extractAndStructureData({
        documentText: values.documentText,
        expectedStructure:
          "Extract the client's full name, CPF, requested loan amount, email and phone number. Return the data as a valid JSON object with keys: 'clientName' (string), 'cpf' (string, formatted as XXX.XXX.XXX-XX), 'loanAmount' (number), 'email' (string), and 'phone' (string, formatted as (XX) XXXXX-XXXX).",
      });

      const parsedData = JSON.parse(result.structuredData);
      setExtractedData(parsedData);
      
      proposalForm.setValue("clientName", parsedData.clientName || "");
      proposalForm.setValue("cpf", parsedData.cpf || "");
      proposalForm.setValue("loanAmount", parsedData.loanAmount || 0);
      proposalForm.setValue("email", parsedData.email || "");
      proposalForm.setValue("phone", parsedData.phone || "");

      toast({
        title: "Dados Extraídos com Sucesso!",
        description: "Verifique e confirme os dados abaixo.",
      });

    } catch (error) {
      console.error("Extraction error:", error);
      toast({
        variant: "destructive",
        title: "Erro na Extração",
        description: "Não foi possível extrair os dados. Verifique o texto ou tente novamente.",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const onConfirm = (values: z.infer<typeof proposalFormSchema>) => {
    onDataExtracted(values);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>1. Extrair Dados do Documento</CardTitle>
        <CardDescription>
          Cole o conteúdo do documento abaixo para que a IA possa extrair e estruturar as informações da proposta.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...extractForm}>
          <form onSubmit={extractForm.handleSubmit(handleExtract)} className="space-y-4">
            <FormField
              control={extractForm.control}
              name="documentText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conteúdo do Documento</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Cole aqui o texto do contrato, e-mail ou outro documento..."
                      className="min-h-[150px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isExtracting} className="bg-accent hover:bg-accent/90">
              {isExtracting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Extraindo...
                </>
              ) : (
                "Extrair Dados"
              )}
            </Button>
          </form>
        </Form>

        {extractedData && (
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-medium">Verificar Dados Extraídos</h3>
            <Form {...proposalForm}>
              <form onSubmit={proposalForm.handleSubmit(onConfirm)} className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                    control={proposalForm.control}
                    name="clientName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nome do Cliente</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={proposalForm.control}
                    name="cpf"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>CPF</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={proposalForm.control}
                    name="loanAmount"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Valor do Empréstimo</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={proposalForm.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={proposalForm.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                 </div>
                <Button type="submit">Confirmar e Avançar</Button>
              </form>
            </Form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
