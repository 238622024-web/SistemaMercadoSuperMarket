


      document.addEventListener("DOMContentLoaded", function () {
        const chartCanvas = document.getElementById("salesChart");
        const periodSelect = document.getElementById("periodSelect");
        const dailyRevenue = Array.from({ length: 90 }, function (_, index) {
          const weeklyEffect = [0.84, 0.91, 0.98, 1.03, 1.12, 1.28, 1.19][
            index % 7
          ];
          const trend = 0.86 + (index / 90) * 0.22;
          return Math.round(
            (2100 + ((index * 173) % 980)) * weeklyEffect * trend,
          );
        });
        const categoryData = [
          { name: "Mercearia", value: 38, color: "" },
          { name: "Bebidas", value: 24, color: "orange" },
          { name: "Hortifruti", value: 18, color: "blue" },
          { name: "Açougue", value: 12, color: "red" },
          { name: "Limpeza", value: 8, color: "" },
        ];
        const productData = [
          ["Arroz Tipo 1 5kg", "342 unidades vendidas", "R$ 8.892"],
          ["Refrigerante Cola 2L", "286 unidades vendidas", "R$ 5.434"],
          ["Leite Integral 1L", "274 unidades vendidas", "R$ 1.918"],
          ["Cerveja Lata 350ml", "248 unidades vendidas", "R$ 1.736"],
          ["Cafe Torrado 500g", "193 unidades vendidas", "R$ 3.377"],
        ];

        function formatCurrency(value) {
          return value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
            maximumFractionDigits: 0,
          });
        }

        function updateCategories() {
          document.getElementById("categoryList").innerHTML = categoryData
            .map(function (category) {
              return (
                '<div class="category-row"><div class="category-label"><span>' +
                category.name +
                "</span><span>" +
                category.value +
                '%</span></div><div class="progress-track"><div class="progress-value ' +
                category.color +
                '" style="width:' +
                category.value +
                '%"></div></div></div>'
              );
            })
            .join("");
        }

        function updateProducts() {
          document.getElementById("productList").innerHTML = productData
            .map(function (product, index) {
              return (
                '<div class="product-row"><span class="product-rank">' +
                (index + 1) +
                '</span><div><div class="product-name">' +
                product[0] +
                '</div><div class="product-detail">' +
                product[1] +
                '</div></div><span class="product-total">' +
                product[2] +
                "</span></div>"
              );
            })
            .join("");
        }

        function drawChart(values) {
          const context = chartCanvas.getContext("2d");
          const width = chartCanvas.clientWidth;
          const height = chartCanvas.clientHeight;
          const ratio = window.devicePixelRatio || 1;
          chartCanvas.width = width * ratio;
          chartCanvas.height = height * ratio;
          context.scale(ratio, ratio);
          context.clearRect(0, 0, width, height);
          const padding = { top: 12, right: 10, bottom: 28, left: 46 };
          const chartWidth = width - padding.left - padding.right;
          const chartHeight = height - padding.top - padding.bottom;
          const maximum = Math.ceil(Math.max.apply(null, values) / 1000) * 1000;
          const minimum =
            Math.floor(Math.min.apply(null, values) / 1000) * 1000;
          const range = maximum - minimum || 1;

          context.font = "11px Inter, sans-serif";
          context.strokeStyle = "#e2e8f0";
          context.fillStyle = "#94a3b8";
          context.lineWidth = 1;
          for (let line = 0; line <= 3; line += 1) {
            const y = padding.top + (chartHeight / 3) * line;
            context.beginPath();
            context.moveTo(padding.left, y);
            context.lineTo(width - padding.right, y);
            context.stroke();
            context.fillText(
              formatCurrency(maximum - (range / 3) * line),
              0,
              y + 4,
            );
          }

          const points = values.map(function (value, index) {
            return {
              x:
                padding.left +
                (chartWidth / Math.max(values.length - 1, 1)) * index,
              y:
                padding.top +
                chartHeight -
                ((value - minimum) / range) * chartHeight,
            };
          });
          const gradient = context.createLinearGradient(
            0,
            padding.top,
            0,
            height,
          );
          gradient.addColorStop(0, "rgba(15, 118, 110, .24)");
          gradient.addColorStop(1, "rgba(15, 118, 110, 0)");
          context.beginPath();
          context.moveTo(points[0].x, height - padding.bottom);
          points.forEach(function (point) {
            context.lineTo(point.x, point.y);
          });
          context.lineTo(points[points.length - 1].x, height - padding.bottom);
          context.closePath();
          context.fillStyle = gradient;
          context.fill();
          context.beginPath();
          points.forEach(function (point, index) {
            index === 0
              ? context.moveTo(point.x, point.y)
              : context.lineTo(point.x, point.y);
          });
          context.strokeStyle = "#0f766e";
          context.lineWidth = 2.5;
          context.stroke();
          context.fillStyle = "#64748b";
          context.textAlign = "center";
          [0, Math.floor(values.length / 2), values.length - 1].forEach(
            function (index) {
              context.fillText("D" + (index + 1), points[index].x, height - 8);
            },
          );
          context.textAlign = "start";
        }

        function updateDashboard() {
          const period = Number(periodSelect.value);
          const values = dailyRevenue.slice(-period);
          const revenue = values.reduce(function (total, value) {
            return total + value;
          }, 0);
          const sales = Math.round(
            revenue / (period === 7 ? 64 : period === 30 ? 66 : 68),
          );
          document.getElementById("revenueValue").textContent =
            formatCurrency(revenue);
          document.getElementById("salesValue").textContent =
            sales.toLocaleString("pt-BR");
          document.getElementById("ticketValue").textContent = (
            revenue / sales
          ).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
          document.getElementById("marginValue").textContent =
            (27.2 + period / 100).toLocaleString("pt-BR", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            }) + "%";
          drawChart(values);
        }

        periodSelect.addEventListener("change", updateDashboard);
        window.addEventListener("resize", updateDashboard);
        document
          .getElementById("exportButton")
          .addEventListener("click", function () {
            const csv =
              "Indicador;Valor\nFaturamento;" +
              document.getElementById("revenueValue").textContent +
              "\nVendas;" +
              document.getElementById("salesValue").textContent +
              "\nTicket medio;" +
              document.getElementById("ticketValue").textContent +
              "\nMargem bruta;" +
              document.getElementById("marginValue").textContent;
            const link = document.createElement("a");
            link.href = URL.createObjectURL(
              new Blob([csv], { type: "text/csv;charset=utf-8;" }),
            );
            link.download = "analise-mercado.csv";
            link.click();
            URL.revokeObjectURL(link.href);
          });
        updateCategories();
        updateProducts();
        updateDashboard();
      });
    