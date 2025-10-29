# Portfolio Rebalancer

Sistema de gestión y rebalanceo de portafolios de inversión implementado en TypeScript.

## 📋 Descripción

Este proyecto implementa un sistema de rebalanceo de portafolios que permite:
- Crear y gestionar un portafolio de inversiones con múltiples acciones
- Definir asignaciones objetivo (target allocations) para cada activo
- Detectar desviaciones en las asignaciones causadas por cambios de precios
- Rebalancear automáticamente el portafolio considerando restricciones de efectivo disponible

## 🚀 Cómo ejecutar el código

### Prerrequisitos
- Node.js (v16 o superior)
- npm

### Instalación

```bash
# Instalar dependencias
npm install
```

### Ejecución

```bash
# Ejecutar el ejemplo con ts-node
npm run dev

# O alternativamente
npx ts-node main.ts
```

## 📁 Estructura del proyecto

```
Fintual/
├── main.ts                          # Archivo principal con ejemplo de uso
├── package.json                     # Configuración del proyecto
├── tsconfig.json                    # Configuración de TypeScript
└── src/
    ├── entities/                    # Entidades del dominio
    │   ├── portfolio.entity.ts      # Clase Portfolio (gestión de portafolio)
    │   ├── position.entity.ts       # Clase Position (posición en una acción en portfolio)
    │   └── stock.entity.ts          # Clase Stock (acción individual)
    └── utils/                       # Utilidades y helpers
        ├── display-allocations.utils.ts  # Función para mostrar asignaciones
        └── display-orders.utils.ts       # Función para mostrar órdenes
```

### Descripción de archivos principales

- **`main.ts`**: Contiene un ejemplo completo que demuestra el flujo de rebalanceo con cambios de precios
- **`portfolio.entity.ts`**: Gestiona el portafolio, calcula asignaciones y ejecuta el rebalanceo
- **`position.entity.ts`**: Representa una posición (cantidad de acciones de un stock específico)
- **`stock.entity.ts`**: Representa una acción con su símbolo y precio
- **`display-*.utils.ts`**: Funciones auxiliares para formatear la salida en consola

## 📝 Proceso de desarrollo

_Esta sección documenta el proceso paso a paso para llegar a la solución final:_

### 1. Análisis inicial del problema
Al leer el enunciado no logré entender correctamente como funciona o debería funcionar un portafolio de stocks. Entonces estuve haciendo un par de preguntas a Claude para entender mejor el problema antes de pensar y diseñar la solución.

Luego de conversar con Claude, determiné que la complejidad estaría en el metodo de rebalanceo, ya que se podrían tomar varias decisiones para rebalancear un portafolio y podría ser muy específico o detallada la forma de rebalanceo y alejarse un poco de este ejercicio de prueba (Y no le quiero hacer la competencia a Fintual, aun...).
Por lo tanto, con el fin de encontrar un balance entre la complejidad que puede significar el manejo de un portafolio de stocks y el ejercicio de prueba, tomé los siguientes supuestos y desiciones para el metodo de rebalanceo:
* Se manejará un umbral de rebalanceo del 5% para determinar si se debe rebalancear cada posición del portafolio.
* No se tomarán en cuenta comisiones o similares al "vender" o "comprar" una posición.
* Los portafolios tendrán un efectivo disponible para comprar stocks, por lo tanto al comprar una posición se tendrá que ver si el efectivo disponible es suficiente para comprar la cantidad de stocks requerida.
* Como se tendrá un umbral, se hará un "Rebalanceo Parcial", es decir, se rebalancearán las posiciones que tengan una desviación mayor al umbral primero ya que puede que no se tenga suficiente efectivo disponible para rebalancear todas las posiciones a la vez.
* Se harán las ordenes de "venta" primero para liberar efectivo y luego se harán las ordenes de "compra" para comprar las posiciones que faltan.

**Se puede ver todo el detalle de la conversación con claude en este link: [Conversación con Claude](https://claude.ai/share/e54879a9-8437-4742-aa65-4b80fd121e7b)**

### 2. Diseño de las entidades
Se manejarán las siguientes entidades:
* Portfolio: Representa un portafolio de stocks.
* Position: Representa una posición en un stock en un portfolio.
* Stock: Representa un stock.
* Order: Representa una orden de compra o venta de un stock
* PendingOrder: Representa una orden pendiente de ejecución.

Pensé las entidades como si fueran tablas de una base de datos y en un inicio solo quería trabajar con `Portfolio` y `Stock`. Pero al intentar trabajar con las stocks de un portfolio y estas tienen una relación N:N, dado que las stock es solo una representación de un activo, no me hacía sentido tener que instanciar N stocks para un portfolio junto a un arreglo de cada una de ellas, y decidí agregar la entidad `Position` para representar la cantidad de stocks en un portfolio.

Las entidades `Order` y `PendingOrder` no se crearon como clases ya que solo se utilizan para representar una orden de compra o venta de un stock y poder "mostrarlas" en la consola. Pero si las considero posibles tablas en una base de datos ya que en un escenario mas real, se podrían guardar las ordenes en una base de datos para poder consultar el historial de ordenes y el estado de las mismas.

### 3. Implementación del algoritmo de rebalanceo
Para poder rebalancear un portafolio, se hace lo siguiente:
* Se debe calcular el valor del portafolio
* Se calcula la asignación actual de cada stock en el portafolio en base al valor del portafolio
* Se calcula la diferencia entre la asignación actual y la asignación objetivo de cada stock
* Se calcula la cantidad de stocks a comprar o vender para rebalancear el portafolio en base a la diferencia calculada
* Se ejecutan las ordenes de venta para liberar efectivo y luego se ejecutan las ordenes de compra para comprar las posiciones que faltan

### 4. Testeo y documentación
Para poder probar su funcionamiento, se creó el archivo `main.ts` con la ayuda de Claude Code para simplificar el trabajo y hacer las pruebas lo más rapido posible, se puede ejecutar con el comando `npm run dev` pero tambien se deja un ejemplo del resultado que se puede obtener al ejecutar el archivo en este README.

Para poder generar el README.md, tambien se utilizó Claude Code para simplificar el trabajo.

En ambos casos se iteró manualmente el codigo autogenerado por lo que el resultado final no es exactamente el mismo que el autogenerado por Claude Code.

Dado que las conversaciones con Claude Code no se pueden compartir, se copio toda la conversación en un archivo txt por si se quiere revisar `claude-code-conversation.txt`

## 🔧 Ejemplo de uso

```typescript
import Portfolio from './src/entities/portfolio.entity';
import Stock from './src/entities/stock.entity';

// Crear acciones
const aapl = new Stock('AAPL', 150);
const meta = new Stock('META', 300);

// Crear portafolio con $10,000 en efectivo
const portfolio = new Portfolio('Mi Portafolio', 10000);

// Definir asignaciones objetivo
const allocations = new Map<string, number>();
allocations.set('AAPL', 0.70);  // 70%
allocations.set('META', 0.30);  // 30%
portfolio.setTargetAllocations(allocations);

// Comprar acciones iniciales
portfolio.addPosition(aapl, 30);
portfolio.addPosition(meta, 10);

// Cambiar precios
aapl.currentPrice(180);
meta.currentPrice(250);

// Rebalancear
const orders = portfolio.rebalance();
console.log(orders);  // [{ stock: aapl, quantity: 5, action: 'SELL' }, ...]
```


## 📊 Ejemplo de ejecución main.ts

Al ejecutar `npm run dev`, se muestra el siguiente output:

```
🎯 Portfolio Rebalancing Example with Cash Management

════════════════════════════════════════════════════════════

📍 Step 1: Initialize Stocks
  AAPL: $150
  META: $300
  FNTL: $100

📍 Step 2: Create Portfolio with Initial Cash
  Starting with $10000.00 in cash
  Target allocations: 50% AAPL, 20% META, 30% FNTL

📍 Step 3: Purchase Initial Positions
  Buying 33 AAPL shares
  Buying 6 META shares
  Buying 30 FNTL shares

📍 Step 4: Initial Portfolio State

📊 Current Allocations:
────────────────────────────────────────────────────────────
AAPL   |   33 shares @ $150.00 = $  4950.00 | 50.77%
META   |    6 shares @ $300.00 = $  1800.00 | 18.46%
FNTL   |   30 shares @ $100.00 = $  3000.00 | 30.77%
────────────────────────────────────────────────────────────
Stocks Value:   $9750.00
Cash Available: $250.00
Total Value:    $10000.00

📍 Step 5: Stock Prices Change
────────────────────────────────────────────────────────────
  AAPL: $150 → $180 (+20%)
  META: $300 → $270 (-10%)
  FNTL: $100 → $110 (+10%)

📍 Step 6: Allocations After Price Changes (Drift Detected)

📊 Current Allocations:
────────────────────────────────────────────────────────────
AAPL   |   33 shares @ $180.00 = $  5940.00 | 54.70%
META   |    6 shares @ $270.00 = $  1620.00 | 14.92%
FNTL   |   30 shares @ $110.00 = $  3300.00 | 30.39%
────────────────────────────────────────────────────────────
Stocks Value:   $10860.00
Cash Available: $250.00
Total Value:    $11110.00

📍 Step 7: Rebalance Portfolio
  Note: SELL orders execute first (freeing up cash)
        Then BUY orders execute (limited by available cash)

📋 Rebalancing Orders:
────────────────────────────────────────────────────────────
📉 SELL    2 shares of AAPL
📈 BUY     2 shares of META
────────────────────────────────────────────────────────────

📍 Step 8: Portfolio After Rebalancing

📊 Current Allocations:
────────────────────────────────────────────────────────────
AAPL   |   31 shares @ $180.00 = $  5580.00 | 50.54%
META   |    8 shares @ $270.00 = $  2160.00 | 19.57%
FNTL   |   30 shares @ $110.00 = $  3300.00 | 29.89%
────────────────────────────────────────────────────────────
Stocks Value:   $11040.00
Cash Available: $70.00
Total Value:    $11110.00

════════════════════════════════════════════════════════════
✅ Rebalancing Complete!
```

## 🎯 Características principales

### 1. **Gestión de efectivo (Cash Management)**
El portafolio mantiene un registro del efectivo disponible:
- Al comprar acciones, el efectivo se reduce
- Al vender acciones, el efectivo aumenta
- Las órdenes de compra están limitadas por el efectivo disponible

### 2. **Rebalanceo automático**
El sistema detecta cuando las asignaciones se desvían del objetivo y genera órdenes para corregirlas:
- Calcula la diferencia entre asignación actual y objetivo
- Solo rebalancea si la diferencia supera un umbral (threshold: 5%)
- Genera órdenes de VENTA primero (para liberar efectivo)
- Luego ejecuta órdenes de COMPRA (limitadas por efectivo disponible)

### 3. **Asignaciones objetivo (Target Allocations)**
Define qué porcentaje del portafolio debe estar invertido en cada activo:
- Ejemplo: 50% AAPL, 20% META, 30% FNTL
- Las asignaciones deben sumar 1.0 (100%)

### 4. **Threshold de rebalanceo**
Un umbral del 5% evita rebalanceos excesivos:
- Solo se rebalancea si la desviación supera el 5%
- Reduce costos de transacción en escenarios reales

## Dato curioso 🤔
Si te preguntas por que se usó el nombre de "baby-shark-69142021112" para el repositorio, es porque como el proyecto se compartirá de forma pública, no quería que fuese facil encontrar en Github, ya que si buscas "Portfolio Fintual" o similares y los ordenas por fecha, puedes encontrar pruebas de otros postulantes.

69142021112 es fintual escrito con numeros segun Claude.